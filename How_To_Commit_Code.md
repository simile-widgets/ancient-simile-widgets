# Introduction #

This article describes 2 ways of committing code
  * Using SVN command line
  * Using Eclipse

Note: to obtain your password for committing code, in this very Google Code project web site, click on the Source tab. It should contain a link to retrieve your generated password.

# Using SVN Command Line #

## Download and install ##
  * Subversion: http://subversion.tigris.org/project_packages.html
  * Ant: http://ant.apache.org/bindownload.cgi

## Check out the code (example for Exhibit project) ##
  * change to the parent directory of where you want to put the Exhibit code base
  * run at the command line
> > svn checkout https://simile-widgets.googlecode.com/svn/exhibit/trunk/ exhibit --username your-google-code-id
  * once that's done, you have a new directory "exhibit"

## Working with the code ##
  * make changes to the code, test locally, etc.
  * If the project has a CHANGES file (Timeline does), please add a specific note about what you are changing and why.
  * If you are adding a feature, please add an example usage.
  * In general, the default for new features should be off.

### New Timeline features ###
  * Features for a Timeline band should be controlled by the theme file. Per-event features should be controlled by adding a new event attribute.
  * Please create an example file that demonstrates your new feature. Create the file as a  new example in the examples directory.
  * **Document** your new feature in the wiki

## Preparing to commit your changes ##
  * Run svn update in the "exhibit" directory when you're ready to commit. This will fetch  the latest code (that other people have checked in since your checkout) and alert you to any merge conflicts.
  * inside the "exhibit" directory, run
> > ant

> That will generate the bundle files. This is important. If you don't do this step, then the bundle files don't contain your latest changes.
  * inside the "exhibit" directory, run
> > svn status

> That will list files that have changed and files that are new (i.e., not in SVN). New files are shown with "?" in front.
  * for each new file or new directory, run svn add. For example
> > svn add src/webapp/api/locales/es-co

> Note that adding a new directory automatically adds its files.
  * you might want to run svn status again and check that there is no file with "?" in front.

### Committing your changes ###
  * In the "exhibit" directory, run
> > svn commit -m "EXHIBIT: a comment to describe your changes here"
  * Please prepend the name of the project to the commit message. Will make it much easier to see which commit messages affected which project. Thanks.

# Using Eclipse #

Download and install
  * Subclipse plugin for Eclipse: http://subclipse.tigris.org/
  * Ant: http://ant.apache.org/bindownload.cgi

Adding a new Subversion repository location:
  * In Eclipse, invoke menu Window -> Show View -> Other, select SVN -> SVN Repository, and click OK. You should then see the SVN Repository view in the Eclipse window.
  * Right-click anywhere inside the SVN Repository view and choose New -> Repository Location...
  * Enter https://simile-widgets.googlecode.com/svn/ for the Url field and click Finish.

Checking out the code (example for Exhibit):
  * In the SVN Repository view, expand the https://simile-widgets.googlecode.com/svn/ location, then find "exhibit", and expand it.
  * Right-click on "trunk" in "exhibit" and choose Checkout... Go through that process; it should be straightforward.

Working with the code:
  * make changes to the code, test locally, etc.
  * inside the "exhibit" directory, run
> > ant

> That should generate the bundle files. This is important. If you don't do this step, then the bundle files don't contain your latest changes.

Preparing to commit the code:
  * In Eclipse, in the Package Explorer view or the Navigator view, right-click on the "exhibit" project and choose Refresh. This makes sure Eclipse is updated with all the changes you made to the code in external editors.
  * I'd also recommend right-clicking on the "exhibit" project and invoke Team -> Update... This would get the latest code out (that other people checked in) and alert you to any merge conflicts.
  * Right-click on the "exhibit" project and invoke Team -> Commit... and remember to provide a comment describing the changes you made. As noted above, please prepend the comment with the project name. Eg "TIMELINE: added x feature" or "EXHIBIT: fixed y bug" Thanks.