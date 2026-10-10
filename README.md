# Portfolio website
🔗 [dannyyuan.com](https://dannyyuan.com)

## Updating the IsoQube web app

The optimized Flutter web build is served from `/isoqube-app/`. After changing
the sibling `Other/iso/isonative` project, refresh it and rebuild the Pages
output with:

```powershell
npm run sync:isoqube
npm run build
```

Pass `-IsoQubeProject <path>` directly to `scripts/sync-isoqube-web.ps1` if the
Flutter project is stored somewhere else.
