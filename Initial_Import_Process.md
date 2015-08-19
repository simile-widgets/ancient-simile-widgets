After creating the simile-widgets project on Google Code, in the Source tab, at the bottom there was a link to reset the svn revision # back to 0. This was necessary for svnsync to work in a later step.

On simile.mit.edu server in my home directory
```
  $ svnadmin dump -r 1:HEAD path-to-simile-svn --incremental > complete-dumpfile
  $ cat complete-dumpfile | svndumpfilter include \
      --quiet --drop-empty-revs --renumber-revs \
      ajax dstructs timeline timegrid timeplot exhibit rubik \
      > widgets-dumpfile
  $ svnadmin create temprepo
  $ svnadmin load temprepo < widgets-dumpfile

  $ svnsync init --username userid https://simile-widgets.googlecode.com/svn file://`pwd`/temprepo
  $ svnsync sync --username userid https://simile-widgets.googlecode.com/svn
```

More documentation svndumpfilter [here](http://svnbook.red-bean.com/en/1.0/ch05s03.html#svn-ch-5-sect-3.1.3).

It is extremely important that you do nothing to the code project (including editing its wiki or home page) while svnsync is running. Changes to the code project can go into the repository as commits and confuse svnsync.

Note that "exhibit" was originally called "rubik" and svndumpfilter
would complain if you don't include "rubik".

If the svnsync process stops you need to unlock it and kick it again:
```
  $ svn pdel --revprop -r 0 svn:sync-lock --username userid https://simile-widgets.googlecode.com/svn
  $ svnsync sync --username userid https://simile-widgets.googlecode.com/svn
```

If there's any problem, post questions to [http://groups.google.com/group/google-code-hosting/](http://groups.google.com/group/google-code-hosting/).

There were 1293 commits.