I'll make a french example since I'm a french-speaking guy ;)

  1. Create a '''fr''' folder in the '''l10n''' folder
  1. Create a new '''labellers.js''' in the '''fr''' folder
  1. add the following in the js file:
```
Timeline.GregorianDateLabeller.dayNames["fr"] = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
```
  1. Go to the '''script''' folder
  1. Open up '''labellers.js''' and add the following function under the '''getMonthName''' function at the beginning of the file (near line 15)
```
Timeline.GregorianDateLabeller.getDayName = function(day, locale){return Timeline.GregorianDateLabeller.dayNames[locale][day];}
```
  1. find the '''defaultLabelInterval''' function in the '''labellers.js''' file and modify the '''Timeline.DateTime.DAY''' case in the switch  to the following:
```
text = Timeline.GregorianDateLabeller.getDayName( date.getDay() , this._locale) + ", " + Timeline.GregorianDateLabeller.getMonthName(date.getUTCMonth(), this._locale) + " " + date.getUTCDate();
```

Here's what it looks like:

![http://simile.mit.edu/mediawiki/images/8/8d/Day_label.jpg](http://simile.mit.edu/mediawiki/images/8/8d/Day_label.jpg)