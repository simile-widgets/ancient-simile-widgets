# Introduction #

The usual practice is to store your Timeline's data in an external xml or json file. But you can include the data within the body of your Timeline file if you wish.

# Details #

1. Create a Javascript variable "json" with your JSON Timeline data. Any variable name can be used.

2. After creating your Timeline, load the data:
` eventSource.loadJSON(json, document.location.href); `

3. This technique is demonstrated in Timeline example 3