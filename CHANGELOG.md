## Changelog

AIVFR uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

**AI-features are currently inoperative at the moment.**

#

## [Unreleased]

This update fixes a few major bugs with some new features.

**AI features are now operative** and can be used in the webtool.

#### Added

- You can now use the ‘/development’ route to see the development page for AIVFR straight from the webtool **(#dev)([DEV#17](https://www.notion.so/Move-this-notion-page-into-separate-route-31d164c8ef4080088a12c3e0df4b0d21?pvs=21))**
- The theme of the webapp is intially set to the user’s choice for thier browser **([DEV#16](https://www.notion.so/Theme-set-based-on-browser-settings-31d164c8ef408022adc2d226c9c37185?pvs=21))**

#### Fixed

- Fixed variation calculation error where the inputs give reversed outputs (V East → M ~~Best~~ least) **([DEV#9](https://www.notion.so/variation-bug-fix-316164c8ef408093bf49df949f359a83?pvs=21))**
- Fixed bug where the expenses and brief never appeared on initial download of flight plan **([DEV#12](https://www.notion.so/initial-plan-pdf-error-fix-316164c8ef4080148a0bcfe4f4aac739?pvs=21))**
- Fixed bug where the AI could not generate a route if the departure and arrival aerodromes were the same **([DEV#11](https://www.notion.so/fix-same-departure-arrival-bug-316164c8ef4080918c3fdbe08b667377?pvs=21))**

### [1.0.0-beta](https://github.com/TheEasyPilot/AIVFR/releases/tag/v1.0.0-beta) - 2026-03-05

Initial development is complete! AIVFR is now in beta where it will probably stay for quite some time.

#### Added

- **NEW TAB**: Dashboard. The Dashboard shows a summary of all currently entered flight details, listed below:
- Route information:
  - Departure → Arrival
  - Time and distance
  - Alternate aerodrome
    
- Aircraft weight and performance:
  - Persons on board
  - Cargo weight
  - Fuel
  - Total (ramp)
  - MTOW, MLW
  - TOD, LD
  
- Route details:
  - Route
  - Cruise and groundspeed
  - Alternate details
  - Display weather reports
  - Allow the user to add expenses to their flight

- Added Open Graph formatting for social media and search engines
- Users can use AI to generate a briefing for the entire flight
- All flight data can be downloaded as pdf *(quite buggy at the moment)*
- Switched the flight data file away from a flask session cookie to an actual database (4KB is NOT enough space :sob:)
- Added github and notion links in main menu

### Fixed

- Weather reports now operative again after errors occurring due to new CheckWX version

### Removed

- Removed cloudbase data from weather reports as CheckWXAPI no longer supports it
- Navlog will now clear completely if you edit your route. Removed ability for table data to be saved due to complications with row-order and making (will be fixed in future updates)

### [0.7.1-alpha](https://github.com/TheEasyPilot/AIVFR/releases/tag/v0.7.1-alpha) - 2026-02-02 [YANKED]

#### Fixed

- Fixed changelog display bug caused by directory fetching issues
- updated log to include brackets where necessary

### [0.7.0-alpha](https://github.com/TheEasyPilot/AIVFR/releases/tag/v0.7.0-alpha) - 2026-02-02

#### Added

- Added changelog
- Added plane silhouette backdrop to main menu
- Current functionality: Menu, settings, route setup, WX, navlog, fuel, mass and balance and performance tabs

### [0.1.0-alpha](https://github.com/TheEasyPilot/AIVFR/releases/tag/v0.1.0-alpha) - 2025-12-29

#### Changed

- Initial web deployment via Railway.com for development. (www.aivfr.co.uk). This webpage may not always be available.

Earlier Internal versions are not consistently versioned and shall not appear here as I simply can't link them!
