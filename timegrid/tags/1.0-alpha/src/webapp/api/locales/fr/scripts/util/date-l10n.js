/******************************************************************************
 *  Timegrid Date French localization
 *****************************************************************************/

if (!("l10n" in Date)) {
    Date.l10n = {};
}
 
/** Full month names. Change this for local month names */
Date.l10n.monthNames =[ 'janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

/** Month abbreviations. Change this for local month abbreviations */
Date.l10n.monthAbbreviations = [ 'janv', 'fevr', 'mars', 'avril', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'dec' ];

/** Full day names. Change this for local day names. */
Date.l10n.dayNames = [ 'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi' ];

/** Day abbreviations. Change this for local day abbreviations */
Date.l10n.dayAbbreviations = ['dim','lun','mar','mer','jeu','ven','sam'];

/**
 * Used for parsing ambiguous dates like 1/2/2000 - default to preferring
 * 'American' format meaning Jan 2. Set to false to prefer 'European' format 
 * meaning Feb 1.
 */
Date.l10n.preferAmericanFormat = false;

/** Used to specify which day the week starts on, 0 meaning Sunday, etc. */
Date.l10n.firstDayOfWeek = 1;
