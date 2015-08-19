# Exhibit #
Exhibit enables you to create html pages with dynamic exhibits of data collections without resorting to complex database and server-side technologies. The collections can be searched and browsed using faceted browsing. Assorted views are provided including Timelines, tiles, maps, and more.

## More Information ##
Please see the [MIT wiki](http://simile.mit.edu/wiki/Exhibit) for more information about Exhibit. The Mailing list is also a good place to ask for assistance.

## Examples in the Wild ##
  * [Exhibit](http://libdev.law.columbia.edu/neweres/sorted.html) of Legal databases at the Columbia University Law Library
  * [Jewish History and People](https://fc.gannacademy.org/gannopedia/jhistory/jhexhibit.html)
  * [Examples on the MIT Exhibit wiki](http://simile.mit.edu/wiki/Exhibit/Examples)
  * [A Protein visualization interface using sequence position as the Timeline x-axis. It shows where proteins are cut by proteolysis.](http://substrate.burnham.org/) Includes modification of Timeline component to use domain-specific units (sequence position) on the x-axis instead of date/time units.

## Runtime Architecture ##
Exhibit is a set of Javascript files that run in a user's browser. In addition, a "painter service" is used. A public painter service is hosted on a MIT server. Or you can locally host your own painter service. The available painter source uses Java, or you can write your own server.

### Hosting ###
Our thanks to MIT for hosting a publicly available Exhibit service. The MIT server can be used for run-time access to the Exhibit Javascript libraries, asset files (images and CSS) and the public painter service. When starting with Exhibit, most people use the MIT server.

If you have any sort of mission-critical use of Exhibit, you may well wish to host it yourself. While the MIT server is reliable, it is not actively managed by an operations group. [Some information on hosting Exhibit on your own server.](http://www.stevetrefethen.com/blog/HostingMITsSimileExhibitOSProject.aspx)

**Please do not add comments to this page, they are not read. Instead, use the mailing list. Thanks.**