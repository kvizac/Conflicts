# Civilian Harm Monitor

Source-led civilian harm dashboard for GitHub Pages. Plain HTML, CSS and JavaScript; no build or package installation required.

## Publication

In this repository open **Settings → Pages**. Choose **Deploy from a branch**, select **main** and **/ (root)**, then Save.

Expected address after GitHub completes publication: https://kvizac.github.io/Conflicts/

## Evidence and limitations

The initial Gaza, Sudan and Ukraine cohort uses AOAV’s 2025 civilian deaths from explosive weapons. It is not a verified current global ranking by all civilian deaths. Newer reports are shown separately with their own dates and attribution. The methodology appears on the website.

Official claims and independently published reports are separate layers; publication by an independent intermediary does not independently verify the originating claim. Actor attribution and weapon type are preserved only where supported. Unknown values are not zero.

Matched deaths-per-munition ratios are withheld until compatible civilian-only, weapon-specific, actor-specific expenditure and casualty series are available. The optional harmful-incident metric is explicitly restricted to the source’s casualty-producing reporting sample.

## Updates

No scheduled task, cron job or scheduled workflow is enabled. The site displays the evidence snapshot in `data.json`. Update this file only after checking original sources, report dates, observation periods, definitions, revisions and overlaps. Preserve unknown values as null; do not add overlapping totals or treat total deaths as civilian-only deaths. Update the review timestamp only after a substantive review.

Relative asset URLs support the /Conflicts/ project path. `.nojekyll` tells GitHub Pages to serve the static files directly.

## Version 2 evidence correction
Headlines now use Palestinian authority reporting for Gaza, UN-verified cumulative civilian deaths for Ukraine, and a clearly limited UN drone-death period for Sudan. Gaza is a rounded greater-than-73,000 threshold, not an exact total or a civilian-only estimate. Reporting-window averages use inclusive UTC calendar days; phase duration is a separate measure. Official launch records are displayed independently of ratio eligibility. No schedules were added.
