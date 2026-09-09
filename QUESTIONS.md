# Open questions

Non-blocking points parked during the rewrite, for Baptiste to settle.

## Deployment

- **Custom domain.** GitHub Pages is the deployment target. Serving it at
  `minecraftle.staging-koumoul.com` needs a CNAME to `<account>.github.io` on the
  Koumoul zone, which has to override the existing `*.staging-koumoul.com`
  wildcard pointing at `146.59.240.102`. Until that record exists the game lives
  at `https://<account>.github.io/<repo>/`. A Kubernetes manifest in
  `env-staging3` remains the alternative if the DNS change is unwanted.

## Gameplay

- **Green now requires unanimity.** A slot only turns green when it is correct in
  *every* placement of the recipe still possible. That is what makes the feedback
  independent of the order placements are generated in, and it is what fixes
  upstream issue #67 — but it is slightly less generous than the original, which
  would sometimes green a slot on the strength of one arbitrarily chosen
  placement. Worth playing a few rounds to confirm the difficulty still feels
  right.
- **Recipes stop at Minecraft 1.26.2**, inherited from upstream. Upstream PR 60
  adds the Nether Reactor Core; issue #69 asks for many more recipes and for
  absurdle / 4x / hard modes. None of that is in scope here.

## Content

- **Audio.** The original shipped a music track that was commented out in the
  layout and never played. It has not been carried over; say if you want it back.
- **Analytics.** Google Analytics was removed and nothing replaced it.
