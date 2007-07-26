/******************************************************************************
 *  Timegrid NDayLayout English localization
 *****************************************************************************/

if (!("l10n" in Timegrid.NDayLayout)) {
    Timegrid.NDayLayout.l10n = {};
}
 
Timegrid.NDayLayout.l10n.makeTitle = function(n) { return n + "-Day"; }

Timegrid.NDayLayout.l10n.makeRange = function(d1, d2) {
    return d1.format(Timegrid.NDayLayout.l10n.startFormat) + " - " +
           d2.format(Timegrid.NDayLayout.l10n.endFormat);
};

Timegrid.NDayLayout.l10n.xLabelFormat = "E M/d";

Timegrid.NDayLayout.l10n.yLabelFormat = "ha";

Timegrid.NDayLayout.l10n.startFormat = "M/d/yyyy";

Timegrid.NDayLayout.l10n.endFormat = "M/d/yyyy";

