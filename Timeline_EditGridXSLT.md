# Introduction #

EditGrid is an online AJAX spreadsheet application similar to Google Spreadsheets. It is unique in that it can take an XML Stylesheet (not Cascading Style Sheet) and rearrange its internal XML output to something useful.

This technique can give you something close to a wiki-style Timeline as there are many options for editor privileges.

## Using EditGrid's XSLT feature to export Timeline XML ##
  1. Log in and create a spreadsheet.
  1. This example is coded assuming columns as:
```
'''start''' (order irrelevant),'''end''' (TRUE on next),'''Authors''' (optional),'''Title''' (only short ones show fully),'''Interior description'''
```
  1. The date fields should have a custom format **`mmm dd yyyy hh:mm:ss`** applied to them. I didn't test without these.
  1. Browse into File->Export->"My Data Formats..."
  1. Create a new output format.
  1. Set the file extension to something (perhaps .xtl)
  1. In the XML Stylesheet section paste the codeblock below.
  1. Finally, use the Permalink on the "My Data Formats..." index to get the XML. I couldn't get the javascript to download links from external sites ("Loading...") with a minimum of fiddling so I set up a cronjob to download it once a day. (Perhaps [Initialize Timeline dynamically](http://simile.mit.edu/mail/ReadMsg?listName=General&msgNo=1148) has information on this but the text is missing currently.)
```

<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns="http://http://simile.mit.edu/timeline"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
>
  <xsl:output method="xml" indent="yes"/>
	  <xsl:template match="/">
		<data>
			<xsl:apply-templates />
		</data>
	</xsl:template>
	<xsl:template match="sheet">
	      <xsl:for-each select="row">
<xsl:if test="not(@row=0)">
               <xsl:if test="not(cell[@col=1] = '')">
		      <event
			      start="{cell[@col=0]}"
			      end="{cell[@col=1]}"
			      isDuration="TRUE"
			      title="{cell[@col=3]}"
			      >
			      <xsl:value-of select="cell[@col=4]"/>
		      </event></xsl:if>
 <xsl:if test="cell[@col=1] = ''">
		      <event
			      start="{cell[@col=0]}"
			      title="{cell[@col=3]}"
			      >
			      <xsl:value-of select="cell[@col=4]"/>
		      </event></xsl:if>

</xsl:if>
	      </xsl:for-each>
	  </xsl:template>
</xsl:stylesheet>
```

I haven't yet added the image attribute and column but that is possible.

Submitted by user (MIT) Thadk at 14:47, on 19 January 2007 (EST)

### Example ###
  * [example spreadsheet](http://www.editgrid.com/user/thadk/example)