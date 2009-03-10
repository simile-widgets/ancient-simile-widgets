
                        +--------------------------+
                        |     BibTex  RDFizer      |
                        +--------------------------+


  What is this?
  ------------

This is yet-another-bibtex-to-RDF converter, designed to perform a very 
low-level transformation of BibTex to RDF. In particular, tex macros and 
syntax in the field values are preserved, rather than being converted to 
some other representation (e.g. Unicode).

The advantage of this is that the resulting RDF data maintains enough
of the original file to reconstruct a version that will produce
identical output when run through bibtex.  This is done by expanding
all the string definitions and cross-references in the source file as
completely as possible.  Thus, these aspects of original file, as well
as syntactic variations like capitalization of fields, are lost in the
transformation.

The disadvantage is that some applications might prefer a higher-level
transformation that removed the tex syntax.  The low-level translation
was choosen because it is fairly easy to remove tex syntax, but
essentially impossible to restore it outside of a limited set of
transformations.

  How do I use it?
  ----------------

To run (on unix/linux/mac os x):

  - build the software using ant: % ant build

  - run bibtex2rdf on your file: % bibtex2rdf myfile.rdf


 What ontology does this RDFizer use?
 ------------------------------------

The destination ontology is a slight modification of bibtex owl
ontology written by Nick Knouf:

http://purl.oclc.org/NET/nknouf/ns/bibtex

Of the three bibtex ontologies I could find, this was the most
"modern" and well documented, and also the most transparent mapping of
bibtex to RDF. In this ontology, a bibtex file consists of a set of
entries, which each have a set of properties, including the type of
entry and the database key that is used to refer to the entry from
within latex.


 How about URIs?
 ---------------

One other noteworthy feature of this parser is the way that it assigns
URIs to entries.  Entries are assigned a URI that is an MD5 hash of
the type, key, and all the fields and values.  Thus, identical entries
that appear in different files (or the same file at a different URL)
will be given identical URIs.  Moreover, this hash is invariant to
permutations in the fields and capitalization variations in the field
keys.  Adding or removing a field or changing a field value will change
the hash.

The URIs are created from a hash of the record data, so multiple imports
the same record will be given the same URI, even if it appears in a
different file. This hash is based on the type, key, and all fields *except*
the crossref field.  If a crossref field is present, then the values from the
crossref are included in the hash. The hash is robust to permutations and
capitalization of the field names, but not changes to the values.

 What is left to do?
 -------------------
 
  - Preserve Bibtex preamble in RDF
  
  
                                  - o -
  
                                  
                                                      Nick Matsakis
