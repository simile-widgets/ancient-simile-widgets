> # Introduction #

Plans created with the Gnome (Linux) application [Planner](http://live.gnome.org/Planner), can be converted with this xslt-script:

Save this xslt as "planner2timeline.xsl":
```

 <?xml version='1.0'  encoding="iso-8859-15"?>
 
 <xsl:stylesheet
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        version='1.0'>
 
 <xsl:output method="xml" encoding="iso-8859-15" indent="yes"/>
 
 <xsl:template match="/">
  <data>
   <xsl:attribute name="wiki-url">http://simile.mit.edu/shelf/</xsl:attribute>
   <xsl:attribute name="wiki-section">
    <xsl:value-of select="/project/@name"/>
   </xsl:attribute>
 
    <xsl:apply-templates select="/project/tasks/*"/>
 
  </data>
 
 </xsl:template>
 
 <xsl:template match="task">
  <event>
   <xsl:attribute name="title">
    <xsl:value-of select="@name"/>
   </xsl:attribute>
 
   <xsl:attribute name="start">
    <xsl:call-template name="format-date">
     <xsl:with-param name="date-time" select="@start" />
    </xsl:call-template>
   </xsl:attribute>
 
   <xsl:if test="@type != 'milestone'">
    <xsl:attribute name="end">
     <xsl:call-template name="format-date">
      <xsl:with-param name="date-time" select="@end" />
     </xsl:call-template>
    </xsl:attribute>
    <xsl:attribute name="isDuration">true</xsl:attribute>
   </xsl:if>
 
   <xsl:value-of select="@note"/>
  </event>
 
  <xsl:apply-templates select="*"/>
 </xsl:template>
 
 <xsl:template name="format-date">
  <xsl:param name="date-time"/>
  <xsl:value-of select="substring($date-time,7,2)"/>
  <xsl:text> </xsl:text>
  <xsl:call-template name="month-name">
   <xsl:with-param name="month-number" select="substring($date-time,5,2)" />
  </xsl:call-template>
  <xsl:text> </xsl:text>
  <xsl:value-of select="substring($date-time,1,4)"/>
  <xsl:text> </xsl:text>
  <xsl:value-of select="substring($date-time,10,2)"/>
  <xsl:text>:</xsl:text>
  <xsl:value-of select="substring($date-time,12,2)"/>
  <xsl:text>:</xsl:text>
  <xsl:value-of select="substring($date-time,14,2)"/>
 </xsl:template>
 
 <xsl:template name="month-name">
  <xsl:param name="month-number"/>
  <xsl:choose>
   <xsl:when test="$month-number=01">Jan</xsl:when>
   <xsl:when test="$month-number=02">Feb</xsl:when>
   <xsl:when test="$month-number=03">Mar</xsl:when>
   <xsl:when test="$month-number=04">Apr</xsl:when>
   <xsl:when test="$month-number=05">May</xsl:when>
   <xsl:when test="$month-number=06">Jun</xsl:when>
   <xsl:when test="$month-number=07">Jul</xsl:when>
   <xsl:when test="$month-number=08">Aug</xsl:when>
   <xsl:when test="$month-number=09">Sep</xsl:when>
   <xsl:when test="$month-number=10">Oct</xsl:when>
   <xsl:when test="$month-number=11">Nov</xsl:when>
   <xsl:when test="$month-number=12">Dec</xsl:when>
  </xsl:choose>
 </xsl:template>
 </xsl:stylesheet>
```

**This xslt ignores everything about timezones, so if you need that, you have to add it yourself.**

Create and save your plan (i.e. as "myplan.planner") with the Planner tool.

Convert your new plan with:

> xsltproc ./planner2timeline.xsl myplan.planner > mytimeline.xml

From here you just have to do the normal java-scripting and HTML coding to do load the timeline data.