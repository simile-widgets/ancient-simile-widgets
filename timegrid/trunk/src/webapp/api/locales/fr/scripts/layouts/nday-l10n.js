/******************************************************************************
 *  Timegrid NDayLayout French localization
 *****************************************************************************/

if (!("l10n" in Timegrid.NDayLayout)) {
    Timegrid.NDayLayout.l10n = {};
}
 
/** Function to create a title string from an n-value */
Timegrid.NDayLayout.l10n.makeTitle = function(n) { return n + "-Jour"; }

/** Function to combine two dates into a string describing the grid's range */
Timegrid.NDayLayout.l10n.makeRange = function(d1, d2) {
    return d1.format(Timegrid.NDayLayout.l10n.startFormat) + " - " +
           d2.format(Timegrid.NDayLayout.l10n.endFormat);
};

/** Format for horizontal "Mon 5/24" style labels */
Timegrid.NDayLayout.l10n.xLabelFormat = "E d/M";

/** Format for vertical "12am" style labels */
Timegrid.NDayLayout.l10n.yLabelFormat = "ha";

/** Format for displaying the grid's starting date, e.g. "6/12/2007" */
Timegrid.NDayLayout.l10n.startFormat = "d/M/yyyy";

/** Format for displaying the grid's ending date, e.g. "6/15/2007" */
Timegrid.NDayLayout.l10n.endFormat = "d/M/yyyy";

