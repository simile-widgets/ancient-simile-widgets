/******************************************************************************
 *  Timegrid NMonthLayout English localization
 *****************************************************************************/
 
if (!("l10n" in Timegrid.NMonthLayout)) {
    Timegrid.NMonthLayout.l10n = {};
}

Timegrid.NMonthLayout.l10n.makeTitle = function(n) { return n + "-Month"; }

Timegrid.NMonthLayout.l10n.makeRange = function(d1, d2) {
    return d1.format(Timegrid.NMonthLayout.l10n.startFormat) + " - " +
           d2.format(Timegrid.NMonthLayout.l10n.endFormat);
};

Timegrid.NMonthLayout.l10n.xLabelFormat = "E M/d";

Timegrid.NMonthLayout.l10n.yLabelFormat = "Ww";

Timegrid.NMonthLayout.l10n.startFormat = "M/d/yyyy";

Timegrid.NMonthLayout.l10n.endFormat = "M/d/yyyy";