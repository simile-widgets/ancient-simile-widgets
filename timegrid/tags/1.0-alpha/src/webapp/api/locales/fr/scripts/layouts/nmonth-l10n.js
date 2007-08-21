/******************************************************************************
 *  Timegrid NMonthLayout French localization
 *****************************************************************************/
 
if (!("l10n" in Timegrid.NMonthLayout)) {
    Timegrid.NMonthLayout.l10n = {};
}

/** Function to create a title string from an n-value */
Timegrid.NMonthLayout.l10n.makeTitle = function(n) { return n + "-Mois"; }

/** Function to combine two dates into a string describing the grid's range */
Timegrid.NMonthLayout.l10n.makeRange = function(d1, d2) {
    return d1.format(Timegrid.NMonthLayout.l10n.startFormat) + " - " +
           d2.format(Timegrid.NMonthLayout.l10n.endFormat);
};

/** Format not needed, localized day names are in Timegrid.l10n.dayNames */
Timegrid.NMonthLayout.l10n.xLabelFormat = "";

/** Format for vertical "W23" style labels */
Timegrid.NMonthLayout.l10n.yLabelFormat = "Ww";

/** Format for displaying the grid's starting date, e.g. "6/12/2007" */
Timegrid.NMonthLayout.l10n.startFormat = "d/M/yyyy";

/** Format for displaying the grid's ending date, e.g. "6/15/2007" */
Timegrid.NMonthLayout.l10n.endFormat = "d/M/yyyy";
