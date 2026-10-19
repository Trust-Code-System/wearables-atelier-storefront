import { accountSession } from "./account-api";
import { wishlistRequest } from "./wishlist-api";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const GUEST_WISHLIST = "wa:wishlist";
export function wishlistIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is string => typeof id === "string" && uuid.test(id),
          ),
        ),
      ].slice(0, 200)
    : [];
}
export type WishlistState = {
  ids: string[];
  accountId: string | null;
  mode: "unknown" | "guest" | "account";
  loading: boolean;
  busy: boolean;
  error: string;
  notice: string;
};
export const initialWishlist: WishlistState = {
  ids: [],
  accountId: null,
  mode: "unknown",
  loading: true,
  busy: false,
  error: "",
  notice: "",
};
export type WishlistDependencies = {
  session: typeof accountSession;
  request: typeof wishlistRequest;
  storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem">;
  randomId: () => string;
};
class PendingWishlistImport extends Error {}

/** No account wishlist is persisted in browser storage. Only guest IDs/import receipts are. */
export class WishlistSync {
  private state = initialWishlist;
  private revision = 0;
  private activeRevision = 0;
  private listeners = new Set<() => void>();
  private tail: Promise<unknown> = Promise.resolve();
  constructor(
    private readonly deps: WishlistDependencies = {
      session: accountSession,
      request: wishlistRequest,
      storage: () => window.localStorage,
      randomId: () => crypto.randomUUID(),
    },
  ) {}
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(change: Partial<WishlistState>, force = false) {
    if (!force && this.activeRevision !== this.revision) return;
    this.state = { ...this.state, ...change };
    for (const listener of this.listeners) listener();
  }
  private guest() {
    const raw = this.deps.storage().getItem(GUEST_WISHLIST);
    try {
      return wishlistIds(raw ? JSON.parse(raw) : []);
    } catch {
      return [];
    }
  }
  private enqueue(work: () => Promise<void>) {
    const next = this.tail.then(async () => {
      this.activeRevision = this.revision;
      this.publish({ busy: true });
      try {
        await work();
        return true;
      } catch (cause) {
        const error =
          cause instanceof Error
            ? cause.message
            : "Unable to sync your wishlist. Please retry.";
        this.publish(
          cause instanceof PendingWishlistImport
            ? { error }
            : { ids: [], mode: "unknown", accountId: null, error },
        );
        return false;
      } finally {
        this.publish({ busy: false, loading: false });
      }
    });
    this.tail = next;
    return next;
  }
  private async synchronize(importGuest = true) {
    const session = await this.deps.session();
    const accountId = session?.user.id ?? null;
    if (accountId !== this.state.accountId)
      this.publish({ ids: [], mode: "unknown", accountId });
    if (!accountId) {
      this.publish({
        ids: this.guest(),
        mode: "guest",
        accountId: null,
        error: "",
        notice: "",
      });
      return;
    }
    const storage = this.deps.storage();
    const importKey = `wa:wishlist-import:${accountId}`;
    let pending: { key: string; ids: string[] } | null = null;
    const saved = importGuest ? storage.getItem(importKey) : null;
    if (saved) {
      try {
        const value = JSON.parse(saved) as { key: string; ids: unknown };
        if (uuid.test(value.key) && wishlistIds(value.ids).length)
          pending = { key: value.key, ids: wishlistIds(value.ids) };
      } catch {
        /* A corrupt import receipt is replaced; guest IDs are separate. */
      }
    }
    const guest = importGuest ? this.guest() : [];
    if (!pending && guest.length) {
      pending = { key: this.deps.randomId(), ids: guest };
      // Persist before sending. A lost response retries this exact key/body.
      storage.setItem(importKey, JSON.stringify(pending));
    }
    let notice = "";
    if (pending) {
      let result;
      try {
        result = await this.deps.request(
          accountId,
          "POST",
          "/merge",
          { productIds: pending.ids },
          pending.key,
        );
      } catch (cause) {
        // Keep the account list usable (for example, to free space at the limit).
        // Guest storage and the original import key remain untouched.
        const current = await this.deps.request(accountId);
        const error =
          cause instanceof Error
            ? cause.message
            : "Guest wishlist import is pending. Please retry.";
        this.publish({
          ids: current.data.map((item) => item.productId),
          mode: "account",
          accountId,
          error,
        });
        throw new PendingWishlistImport(error);
      }
      const transferred = new Set(pending.ids);
      // Preserve items another tab added while the import was in flight.
      storage.setItem(
        GUEST_WISHLIST,
        JSON.stringify(this.guest().filter((id) => !transferred.has(id))),
      );
      storage.removeItem(importKey);
      if (result.skippedProductIds.length)
        notice = "Some saved pieces no longer exist and could not be imported.";
    }
    const result = await this.deps.request(accountId);
    this.publish({
      ids: result.data.map((item) => item.productId),
      accountId,
      mode: "account",
      error: "",
      notice,
    });
  }
  refresh = () => this.enqueue(() => this.synchronize());
  accountChanged = () => {
    // Hide the previous account immediately, before queued network work resumes.
    this.revision++;
    this.publish(
      { ids: [], accountId: null, mode: "unknown", loading: true },
      true,
    );
    return this.refresh();
  };
  toggle = (id: string) => {
    const remove = this.state.ids.includes(id);
    const clickedAccount =
      this.state.mode === "account" ? this.state.accountId : null;
    return this.enqueue(async () => {
      if (!uuid.test(id)) throw new Error("This piece cannot be saved.");
      await this.synchronize(false);
      if (this.activeRevision !== this.revision) return;
      if (clickedAccount && clickedAccount !== this.state.accountId)
        throw new Error(
          "Account changed. Refresh your wishlist before editing.",
        );
      if (this.state.mode === "guest") {
        const current = this.guest();
        if (!remove && current.length >= 200)
          throw new Error("Your wishlist can hold up to 200 pieces.");
        const ids = remove
          ? current.filter((value) => value !== id)
          : [...new Set([...current, id])];
        this.deps.storage().setItem(GUEST_WISHLIST, JSON.stringify(ids));
        this.publish({ ids });
      } else {
        const result = await this.deps.request(
          this.state.accountId!,
          remove ? "DELETE" : "PUT",
          `/items/${encodeURIComponent(id)}`,
        );
        this.publish({ ids: result.data.map((item) => item.productId) });
      }
    });
  };
}
