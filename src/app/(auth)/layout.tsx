import "../(store)/store.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="storefront auth-shell">
      <a href="#auth-content" className="store-skip-link">
        Skip to content
      </a>
      <main id="auth-content" className="auth-main">
        {children}
      </main>
    </div>
  );
}
