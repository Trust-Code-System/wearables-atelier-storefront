# Motion components

Reviewed React Bits and shadcnblocks in the owner's Chrome on 12 October 2026. All changes remain local pending review.

## Storefront

- **Atelier welcome:** an original 1.7-second olive curtain opening on the home page, with the original gold logo and brand line. Plays once per tab session, skips entirely for reduced motion, and dismisses on skip, keyboard, pointer or scrolling intent. It never locks body scrolling or gates server-rendered page content. Its session marker is written after the first frame so development effect replay cannot swallow the intro.
- **Blur Text:** adapted from [React Bits BlurText](https://github.com/DavidHDev/react-bits/blob/main/src/ts-tailwind/TextAnimations/BlurText/BlurText.tsx) for the two-line campaign headline. Word choreography uses a smaller blur and 12px travel, keeps server-rendered content visible, disconnects its observer after the first reveal and respects reduced motion. [Upstream license](./react-bits-license.md) is included.
- **Rubber Segment:** [React Bits reference](https://reactbits.dev/c/micro/rubber-segment) for the existing navigation pill adaptation, preserving Next.js links and active-page semantics.
- **Pulse Heart and Warm Tooltip:** [heart](https://reactbits.dev/c/micro/pulse-heart) and [tooltip](https://reactbits.dev/c/micro/warm-tooltip) patterns inform the local save feedback and header labels. Tooltip timers are cleaned up on unmount and Escape dismisses the tooltip.
- **Magnetic buttons:** [React Bits Magnet](https://reactbits.dev/animations/magnet) informs the campaign CTA and two collection arrows. Pointer movement measures a stationary outer wrapper to avoid jitter; touch, coarse pointers and reduced motion do not activate the effect.
- Product quick-action arrows move slightly toward their destination; jewelry add icons rotate on fine-pointer hover. Purchasing and stock guards stay intact.

## Admin

The original ObsidianUI shell already supplies animated tab pills and menu highlights. Keep that system. Added short press/hover feedback to dashboard actions, subtle metric-surface lift, transitions between actual metric values and anchored filter-menu entrances. Values are not artificially counted up from zero.

[Shadcnblocks Product List](https://www.shadcnblocks.com/blocks/product-list) was reviewed for hover-action placement and [Dashboard](https://www.shadcnblocks.com/blocks/dashboard) for admin composition. These are design references; no premium blocks were copied or purchased. Existing Base UI and Radix primitives keep focus, keyboard and dropdown behavior.

## Boundaries

Keep the compact footer, standalone authentication layouts, original assets, stock labels and header scroll direction. No cursor replacement, background shaders or scroll interception were added. No new runtime dependency was needed.
