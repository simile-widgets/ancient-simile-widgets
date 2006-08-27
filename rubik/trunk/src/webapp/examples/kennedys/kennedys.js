function onLoad() {
    var types = [];
    var properties = [];
    
    var objects = [
{ uri: 'Joseph P. Kennedy', label: 'Joseph P. Kennedy', type: 'Person', gender: 'male', generation: '1st', firstName: 'Joseph', lastName: 'Kennedy', middleInitial: 'P', married: [ 'Rose E. Fitzgerald' ], divorced: [  ], birthDeath: 'September 6, 1888 -- November 16, 1969', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_1_1_1.1.jpg', text: "Joseph Kennedy achieved financial success in the unregulated stock market of the 1920s, pulling out before the market crashed in 1929. He pursued a career as a Hollywood producer and expanded his fortune in the liquor import business. A backer of Franklin Roosevelt, Joe Sr. was appointed ambassador to Great Britain from 1938 until 1940, but fell out of political favor for not supporting the war effort. He devoted the rest of his life to advancing the political careers of his sons, John, Robert and Edward." },
{ uri: 'Rose E. Fitzgerald', label: 'Rose E. Fitzgerald', type: 'Person', gender: 'female', generation: '1st', firstName: 'Rose', lastName: 'Fitzgerald', middleInitial: 'E', married: [ 'Joseph P. Kennedy' ], divorced: [  ], birthDeath: 'July 22, 1890 -- January 22, 1995', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_1_1.1_1.1.jpg', text: "Rose Kennedy, the oldest daughter of Boston politician John Fitzgerald, raised nine children, four of whom died young. The matriarch of the family compound in Hyannis Port, Massachusetts, Rose was an intensely religious woman who campaigned for her sons and served as a public representative of the family's dignity until her death at the age of 104." },
{ uri: 'Joseph P. Kennedy, Jr.', label: 'Joseph P. Kennedy, Jr.', type: 'Person', gender: 'male', generation: '2nd', firstName: 'Joseph', lastName: 'Kennedy', middleInitial: 'P', suffix: 'Jr.', married: [  ], divorced: [  ], parents: [ 'Joseph P. Kennedy', 'Rose E. Fitzgerald' ], birthDeath: 'July 25, 1915 -- August 12, 1944', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_1_1.1.jpg', text: "Rose and Joe's firstborn, Joseph Jr., carried his father's expectations for political success. When the United States entered World War II, Joe left his studies at Harvard to enlist as a Navy pilot. He died during a secret mission in August 1944, when his bomber exploded over the English channel." },
{ uri: 'John F. Kennedy', label: 'John F. Kennedy', type: 'Person', gender: 'male', generation: '2nd', firstName: 'John', lastName: 'Kennedy', middleInitial: 'F', married: [ 'Jacqueline L. Bouvier' ], divorced: [  ], parents: [ 'Joseph P. Kennedy', 'Rose E. Fitzgerald' ], birthDeath: 'May 29, 1917 -- November 22, 1963', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_2_1.1.jpg', text: "A prankster and a sickly child, John, known as Jack, grew up to fulfill his father's political hopes for Joe Jr. Jack served in Congress from 1946 until 1959. In 1957, he received the Pulitzer Prize for Literature for his book Profiles in Courage. Jack was elected to the presidency in 1960, narrowly defeating Vice President Richard Nixon. He was assassinated in Dallas, Texas on November 22, 1963, at the age of 46. John Kennedy married Jacqueline Bouvier on September 12, 1953." },
{ uri: 'Jacqueline L. Bouvier', label: 'Jacqueline L. Bouvier', type: 'Person', gender: 'female', generation: '2nd', firstName: 'Jacqueline', lastName: 'Bouvier', middleInitial: 'L', married: [ 'John F. Kennedy' ], divorced: [  ], birthDeath: 'July 28, 1929 -- May 19, 1994', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_2.1_1.1.jpg', text: "Jacqueline, the 'Debutante of the Year' in 1947-1948, graduated from George Washington University and worked as a photographer for The Washington Times-Herald before meeting the senator from Massachusetts she would marry. Fluent in French and Italian, Jackie brought style and charm to the White House as First Lady.Widowed at age 34, she married Greek tycoon Aristotle Onassis in 1968, and they remained married until his death in 1975. Jackie subsequently embarked on a career as a book editor in New York City, where she lived the rest of her life." },
{ uri: 'Rose M. Kennedy', label: 'Rose M. Kennedy', type: 'Person', gender: 'female', generation: '2nd', firstName: 'Rose', lastName: 'Kennedy', middleInitial: 'M', married: [  ], divorced: [  ], parents: [ 'Joseph P. Kennedy', 'Rose E. Fitzgerald' ], birthDeath: 'September 13, 1918 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_3_1.1.jpg', text: "The first daughter of Joseph and Rose Kennedy, Rosemary suffered from mental retardation. After a failed lobotomy in 1941, she was sent to live in a nursing convent in the Midwest." },
{ uri: 'Kathleen A. Kennedy', label: 'Kathleen A. Kennedy', type: 'Person', gender: 'female', generation: '2nd', firstName: 'Kathleen', lastName: 'Kennedy', middleInitial: 'A', married: [ 'William J.R. Cavendish' ], divorced: [  ], parents: [ 'Joseph P. Kennedy', 'Rose E. Fitzgerald' ], birthDeath: 'February 20, 1920 -- May 13, 1948', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_4_1.1.jpg', text: "Kick, as Kathleen was known in the family, served with the Red Cross in London during World War II. The British magazine Queen described her as 'America's most important debutante' when she arrived in 1938. Widowed at a young age, she died in a plane crash over France with her lover, Peter Fitzwilliam. Kathleen Kennedy married William Cavendish on May 6, 1944." },
{ uri: 'William J.R. Cavendish', label: 'William J.R. Cavendish', type: 'Person', gender: 'male', generation: '2nd', firstName: 'William', lastName: 'Cavendish', middleInitial: 'J.R', married: [ 'Kathleen A. Kennedy' ], divorced: [  ], birthDeath: 'December 10, 1917 -- September 10, 1944', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_4.1_1.1.jpg', text: "William Cavendish, the future duke of the prestigious Cavendish family, was not Catholic and therefore not a suitable match for Kathleen, in Rose and Joseph Kennedy's eyes. The two married nonetheless, but Cavendish died in battle in Europe, only four months later." },
{ uri: 'Eunice M. Kennedy', label: 'Eunice M. Kennedy', type: 'Person', gender: 'female', generation: '2nd', firstName: 'Eunice', lastName: 'Kennedy', middleInitial: 'M', married: [ 'Robert S. Shriver, Jr.' ], divorced: [  ], parents: [ 'Joseph P. Kennedy', 'Rose E. Fitzgerald' ], birthDeath: 'July 10, 1921 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_5_1.1.jpg', text: "Eunice Kennedy has devoted her life to helping the disabled, specifically people with mental retardation. In 1968, she helped found and develop the Special Olympics, which today involve over 1 million participants in more than 150 nations. Eunice Mary Kennedy married Robert Sargent Shriver Jr. on May 23, 1953." },
{ uri: 'Robert S. Shriver, Jr.', label: 'Robert S. Shriver, Jr.', type: 'Person', gender: 'male', generation: '2nd', firstName: 'Robert', lastName: 'Shriver', middleInitial: 'S', suffix: 'Jr.', married: [ 'Eunice M. Kennedy' ], divorced: [  ], birthDeath: 'November 9, 1915 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_5.1_1.1.jpg', text: "R. Sargent Shriver, known as Sarge, served in the Navy during World War II and entered political life by working on his brother-in-law Jack's political campaigns. He was appointed the first director of the Peace Corps in 1961 and the director of the Office of Economic Opportunity (OEO) in 1964. Shriver served as ambassador to France from 1968 until 1970 and made an unsuccessful run for president in 1976." },
{ uri: 'Patricia Kennedy', label: 'Patricia Kennedy', type: 'Person', gender: 'female', generation: '2nd', firstName: 'Patricia', lastName: 'Kennedy', married: [ 'Peter Lawford' ], divorced: [  ], parents: [ 'Joseph P. Kennedy', 'Rose E. Fitzgerald' ], birthDeath: 'May 6, 1924 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_6_1.1.jpg', text: "Patricia Kennedy continued her father's interest in show business when she married actor Peter Lawford. She and Peter became a noted celebrity couple, befriending stars such as Frank Sinatra and Marilyn Monroe. Patricia Kennedy married Peter Lawford on April 24, 1954." },
{ uri: 'Peter Lawford', label: 'Peter Lawford', type: 'Person', gender: 'male', generation: '2nd', firstName: 'Peter', lastName: 'Lawford', married: [ 'Patricia Kennedy' ], divorced: [  ], birthDeath: 'September 7, 1923 -- December 23, 1984', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_6.1_1.1.jpg', text: "Peter Lawford was the first Hollywood star to enter the Kennedy clan. He was a contract player for MGM studios and a member of Frank Sinatra's 'Rat Pack,' the stylish group of entertainers whose Las Vegas excesses became legendary. After he and Patricia Kennedy divorced in 1966, Lawford continued working in Hollywood and was a frequent guest on television game shows." },
{ uri: 'Robert Kennedy', label: 'Robert Kennedy', type: 'Person', gender: 'male', generation: '2nd', firstName: 'Robert', lastName: 'Kennedy', married: [ 'Ethel Skakel' ], divorced: [  ], parents: [ 'Joseph P. Kennedy', 'Rose E. Fitzgerald' ], birthDeath: 'November 20, 1925 -- June 6, 1968', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_7_1.1.jpg', text: "Robert Kennedy served in the Navy during WWII and was the presidential campaign manager for his brother, eventually serving as attorney general during Jack's administration. In 1964 he was elected to the U.S. Senate from New York, despite allegations of being a carpet-bagger. In the wake of President Lyndon Johnson's decision not to run for re-election in 1968, Kennedy pursued the Democratic nomination, only to be assassinated on June 6, 1968, after winning the California primary. Robert Kennedy married Ethel Skakel on June 17, 1950." },
{ uri: 'Ethel Skakel', label: 'Ethel Skakel', type: 'Person', gender: 'female', generation: '2nd', firstName: 'Ethel', lastName: 'Skakel', married: [ 'Robert Kennedy' ], divorced: [  ], birthDeath: 'April 11, 1928 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_7.1_1.1.jpg', text: "Ethel Kennedy was pregnant with her eleventh child at the time of Robert Kennedy's assassination. After her husband's death, Ethel founded the RFK Memorial Organization, which is devoted to human rights and activism." },
{ uri: 'Jean A. Kennedy', label: 'Jean A. Kennedy', type: 'Person', gender: 'female', generation: '2nd', firstName: 'Jean', lastName: 'Kennedy', middleInitial: 'A', married: [ 'Stephen E. Smith' ], divorced: [  ], parents: [ 'Joseph P. Kennedy', 'Rose E. Fitzgerald' ], birthDeath: 'February 20, 1928 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_8_1.1.jpg', text: "In 1974, Jean Kennedy Smith founded Very Special Arts to make artistic programs available to people with disabilities. Her book, Chronicles of Courage: Very Special Artists, was published in 1993. Jean Smith served as Ambassador to Ireland in the Clinton administration, from 1993 until 1998. Jean Ann Kennedy married Stephen Smith on May 19, 1956." },
{ uri: 'Stephen E. Smith', label: 'Stephen E. Smith', type: 'Person', gender: 'male', generation: '2nd', firstName: 'Stephen', lastName: 'Smith', middleInitial: 'E', married: [ 'Jean A. Kennedy' ], divorced: [  ], birthDeath: 'September 24, 1927 -- August 19, 1990', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_8.1_1.1.jpg', text: "Stephen Smith came from a background similar to that of his wife, combining an Irish American heritage with politics and big business. Steve was an active element in the Kennedy political machine and worked on the campaigns of his brothers-in-law John, Robert and Ted." },
{ uri: 'Edward M. Kennedy', label: 'Edward M. Kennedy', type: 'Person', gender: 'male', generation: '2nd', firstName: 'Edward', lastName: 'Kennedy', middleInitial: 'M', married: [ 'Victoria A. Reggie' ], divorced: [ 'Virginia J. Bennett' ], parents: [ 'Joseph P. Kennedy', 'Rose E. Fitzgerald' ], birthDeath: 'February 22, 1932 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_9_1.1.jpg', text: "Edward , known as Ted, was first elected to the U.S. Senate in 1962, representing Massachusetts as his brother John had done. By 2003 he was the third most senior member of the Senate, having been elected to seven full terms.In 1969 he accidentally drove off a bridge in Chappaquiddick, Massachusetts; he survived, but his passenger did not. He pled guilty to leaving the scene of an accident. Questions about the accident persisted and undermined his quest for the Democratic nomination in 1980. Edward Kennedy married Virginia Bennet on November 29, 1958; divorced in 1982." },
{ uri: 'Virginia J. Bennett', label: 'Virginia J. Bennett', type: 'Person', gender: 'female', generation: '2nd', firstName: 'Virginia', lastName: 'Bennett', middleInitial: 'J', married: [  ], divorced: [ 'Edward M. Kennedy' ], birthDeath: 'September 9, 1936 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_9.1_1.1.jpg', text: "Joan Bennett worked as an on-air television model before she married Edward Kennedy in 1958. Throughout the 1970s, she waged a public struggle with alcoholism, and she and Ted divorced in 1982. Edward Kennedy married Victoria Reggie on July 3, 1992." },
{ uri: 'Victoria A. Reggie', label: 'Victoria A. Reggie', type: 'Person', gender: 'female', generation: '2nd', firstName: 'Victoria', lastName: 'Reggie', middleInitial: 'A', married: [ 'Edward M. Kennedy' ], divorced: [  ], birthDeath: 'February 26, 1954 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_2_9.2_1.1.jpg', text: "Victoria Anne Reggie, a divorced attorney with two children, married Edward Kennedy in July, 1992 in a discreet ceremony in the Senator's home." },
{ uri: 'Caroline Kennedy', label: 'Caroline Kennedy', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Caroline', lastName: 'Kennedy', married: [ 'Edwin A. Schlossberg' ], divorced: [  ], parents: [ 'John F. Kennedy', 'Jacqueline L. Bouvier' ], birthDeath: 'November 27, 1957 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_1_2.1.jpg', text: "After graduating from Harvard with a fine arts degree, Caroline worked at the Metropolitan Museum of Art, where she met her husband, Edwin Schlossberg. She pursued graduate studies at Columbia Law School, and is president of the Kennedy Library Foundation. She and her husband have three children." },
{ uri: 'Edwin A. Schlossberg', label: 'Edwin A. Schlossberg', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Edwin', lastName: 'Schlossberg', middleInitial: 'A', married: [ 'Caroline Kennedy' ], divorced: [  ], birthDeath: 'July 19, 1945 --' },
{ uri: 'John F. Kennedy, Jr.', label: 'John F. Kennedy, Jr.', type: 'Person', gender: 'male', generation: '3rd', firstName: 'John', lastName: 'Kennedy', middleInitial: 'F', suffix: 'Jr.', married: [ 'Carolyn Bessette' ], divorced: [  ], parents: [ 'John F. Kennedy', 'Jacqueline L. Bouvier' ], birthDeath: 'November 25, 1960 -- July 16, 1999', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_2_2.1.jpg', text: "John F. Kennedy, Jr. graduated from Brown University and received a law degree from New York University. After four years working in the Manhattan district attorney's office, he entered the publishing world, launching the political magazine George. He died on July 16, 1999 in a crash with his wife, Carolyn Bessette Kennedy, and her sister, while piloting his own plane to a family wedding." },
{ uri: 'Carolyn Bessette', label: 'Carolyn Bessette', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Carolyn', lastName: 'Bessette', married: [ 'John F. Kennedy, Jr.' ], divorced: [  ], birthDeath: 'January 7, 1966 - July 16, 1999' },
{ uri: 'Patrick B. Kennedy', label: 'Patrick B. Kennedy', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Patrick', lastName: 'Kennedy', middleInitial: 'B', married: [  ], divorced: [  ], parents: [ 'John F. Kennedy', 'Jacqueline L. Bouvier' ], birthDeath: 'August 7, 1963 -- August 9, 1963', text: "The third child born to the president and the first lady survived only two days." },
{ uri: 'Robert S. Shriver, III', label: 'Robert S. Shriver, III', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Robert', lastName: 'Shriver', middleInitial: 'S', suffix: 'III', married: [  ], divorced: [  ], parents: [ 'Robert S. Shriver, Jr.', 'Eunice M. Kennedy' ], birthDeath: 'April 28, 1954 --' },
{ uri: 'Maria O. Shriver', label: 'Maria O. Shriver', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Maria', lastName: 'Shriver', middleInitial: 'O', married: [ 'Arnold Schwarzenegger' ], divorced: [  ], parents: [ 'Robert S. Shriver, Jr.', 'Eunice M. Kennedy' ], birthDeath: 'November 6, 1955 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_2_5.1.jpg', text: "Maria Shriver works as a correspondent for the NBC television network. She and her husband, box office star Arnold Schwarzenegger, have four children." },
{ uri: 'Arnold Schwarzenegger', label: 'Arnold Schwarzenegger', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Arnold', lastName: 'Schwarzenegger', married: [ 'Maria O. Shriver' ], divorced: [  ], birthDeath: 'July 30, 1947 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_2.1_5.1.jpg', text: "Arnold Schwarzenegger was born in Austria and achieved international recognition as a bodybuilder in the 1960s and 1970s. A top Hollywood star for his roles in action films like Conan the Barbarian (1982) and the Terminator series (1984-2003), he has become involved in California politics as a moderate Republican." },
{ uri: 'Timothy P. Shriver', label: 'Timothy P. Shriver', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Timothy', lastName: 'Shriver', middleInitial: 'P', married: [ 'Linda S. Potter' ], divorced: [  ], parents: [ 'Robert S. Shriver, Jr.', 'Eunice M. Kennedy' ], birthDeath: 'August 29, 1959 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_3_5.1.jpg', text: "Timothy Shriver is the current president and chief executive officer of the Special Olympics, the organization for people with mental retardation his mother Eunice founded. He and his wife, Linda Potter, have four children." },
{ uri: 'Linda S. Potter', label: 'Linda S. Potter', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Linda', lastName: 'Potter', middleInitial: 'S', married: [ 'Timothy P. Shriver' ], divorced: [  ], birthDeath: 'January 13, 1956 --' },
{ uri: 'Mark K. Shriver', label: 'Mark K. Shriver', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Mark', lastName: 'Shriver', middleInitial: 'K', married: [ 'Jeanne Ripp' ], divorced: [  ], parents: [ 'Robert S. Shriver, Jr.', 'Eunice M. Kennedy' ], birthDeath: 'February 17, 1964 --' },
{ uri: 'Jeanne Ripp', label: 'Jeanne Ripp', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Jeanne', lastName: 'Ripp', married: [ 'Mark K. Shriver' ], divorced: [  ], birthDeath: 'November 30, 1965 --' },
{ uri: 'Anthony P. Shriver', label: 'Anthony P. Shriver', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Anthony', lastName: 'Shriver', middleInitial: 'P', married: [ 'Alina Mojica' ], divorced: [  ], parents: [ 'Robert S. Shriver, Jr.', 'Eunice M. Kennedy' ], birthDeath: 'July 20, 1965 --' },
{ uri: 'Alina Mojica', label: 'Alina Mojica', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Alina', lastName: 'Mojica', married: [ 'Anthony P. Shriver' ], divorced: [  ], birthDeath: 'January 5, 1965 --' },
{ uri: 'Christopher K. Lawford', label: 'Christopher K. Lawford', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Christopher', lastName: 'Lawford', middleInitial: 'K', married: [ 'Jean Olsson' ], divorced: [  ], parents: [ 'Peter Lawford', 'Patricia Kennedy' ], birthDeath: 'March 29, 1955 --', text: "An actor like his father, Christopher Lawford was a mainstay on the soap opera All My Children in the 1990s." },
{ uri: 'Jean Olsson', label: 'Jean Olsson', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Jean', lastName: 'Olsson', married: [ 'Christopher K. Lawford' ], divorced: [  ], birthDeath: '1955 --' },
{ uri: 'Sydney M. Lawford', label: 'Sydney M. Lawford', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Sydney', lastName: 'Lawford', middleInitial: 'M', married: [ 'James P. McKelvey' ], divorced: [  ], parents: [ 'Peter Lawford', 'Patricia Kennedy' ], birthDeath: 'August 25, 1956 --' },
{ uri: 'James P. McKelvey', label: 'James P. McKelvey', type: 'Person', gender: 'male', generation: '3rd', firstName: 'James', lastName: 'McKelvey', middleInitial: 'P', married: [ 'Sydney M. Lawford' ], divorced: [  ], birthDeath: '1955 --' },
{ uri: 'Victoria F. Lawford', label: 'Victoria F. Lawford', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Victoria', lastName: 'Lawford', middleInitial: 'F', married: [ 'Robert B. Pender, Jr.' ], divorced: [  ], parents: [ 'Peter Lawford', 'Patricia Kennedy' ], birthDeath: 'November. 4, 1958 --' },
{ uri: 'Robert B. Pender, Jr.', label: 'Robert B. Pender, Jr.', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Robert', lastName: 'Pender', middleInitial: 'B', suffix: 'Jr.', married: [ 'Victoria F. Lawford' ], divorced: [  ], birthDeath: '1953 --' },
{ uri: 'Robin E. Lawford', label: 'Robin E. Lawford', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Robin', lastName: 'Lawford', middleInitial: 'E', married: [  ], divorced: [  ], parents: [ 'Peter Lawford', 'Patricia Kennedy' ], birthDeath: 'July 2, 1961 --' },
{ uri: 'Kathleen H. Kennedy', label: 'Kathleen H. Kennedy', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Kathleen', lastName: 'Kennedy', middleInitial: 'H', married: [ 'David L. Townsend' ], divorced: [  ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'July 4, 1951 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_1_7.1.jpg', text: "Kathleen Townsend, the first Kennedy woman to hold elected political office, served as Maryland's lieutenant governor from 1995 to 2003," },
{ uri: 'David L. Townsend', label: 'David L. Townsend', type: 'Person', gender: 'male', generation: '3rd', firstName: 'David', lastName: 'Townsend', middleInitial: 'L', married: [ 'Kathleen H. Kennedy' ], divorced: [  ], birthDeath: 'November 17, 1947 --' },
{ uri: 'Joseph P. Kennedy, II', label: 'Joseph P. Kennedy, II', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Joseph', lastName: 'Kennedy', middleInitial: 'P', suffix: 'II', married: [ 'Anne E. Kelly' ], divorced: [ 'Sheila B. Rauch' ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'September 24, 1952 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_2_7.1.jpg', text: "After establishing the Citizens Energy Corporation, a non-profit organization that uses market opportunities to help supply inexpensive heating oil and other commodities to low-income people, Joseph P. Kennedy II was elected to the U.S. House of Representatives from Massachusetts. He served from 1987 through 1999 but stepped down to return to his non-profit work." },
{ uri: 'Sheila B. Rauch', label: 'Sheila B. Rauch', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Sheila', lastName: 'Rauch', middleInitial: 'B', married: [  ], divorced: [ 'Joseph P. Kennedy, II' ], birthDeath: 'March 22, 1949 --' },
{ uri: 'Anne E. Kelly', label: 'Anne E. Kelly', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Anne', lastName: 'Kelly', middleInitial: 'E', married: [ 'Joseph P. Kennedy, II' ], divorced: [  ], birthDeath: 'April 3, 1957 --' },
{ uri: 'Robert F. Kennedy, Jr.', label: 'Robert F. Kennedy, Jr.', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Robert', lastName: 'Kennedy', middleInitial: 'F', suffix: 'Jr.', married: [ 'Mary Richardson' ], divorced: [ 'Emily R. Black' ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'January 17, 1954 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_3_7.1.jpg', text: "Robert Kennedy is a widely respected prosecuting attorney and professor at Pace University School of Law. A defender of the environment, he has written numerous books and articles, and is a licensed master falconer." },
{ uri: 'Emily R. Black', label: 'Emily R. Black', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Emily', lastName: 'Black', middleInitial: 'R', married: [  ], divorced: [ 'Robert F. Kennedy, Jr.' ], birthDeath: 'October 15, 1957 --' },
{ uri: 'Mary Richardson', label: 'Mary Richardson', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Mary', lastName: 'Richardson', married: [ 'Robert F. Kennedy, Jr.' ], divorced: [  ], birthDeath: '1960 --' },
{ uri: 'David A. Kennedy', label: 'David A. Kennedy', type: 'Person', gender: 'male', generation: '3rd', firstName: 'David', lastName: 'Kennedy', middleInitial: 'A', married: [  ], divorced: [  ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'June 15, 1955 -- August 25, 1984', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_4_7.1.jpg', text: "David Kennedy died of a cocaine overdose in Palm Beach, Florida at the age of 28." },
{ uri: 'Mary C. Kennedy', label: 'Mary C. Kennedy', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Mary', lastName: 'Kennedy', middleInitial: 'C', married: [ 'Paul M. Hill' ], divorced: [ 'Jeffery R. Ruhe' ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'September 9, 1956 --' },
{ uri: 'Jeffery R. Ruhe', label: 'Jeffery R. Ruhe', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Jeffery', lastName: 'Ruhe', middleInitial: 'R', married: [  ], divorced: [ 'Mary C. Kennedy' ], birthDeath: '1952 --' },
{ uri: 'Paul M. Hill', label: 'Paul M. Hill', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Paul', lastName: 'Hill', middleInitial: 'M', married: [ 'Mary C. Kennedy' ], divorced: [  ], birthDeath: 'August 13, 1954 --' },
{ uri: 'Michael L. Kennedy', label: 'Michael L. Kennedy', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Michael', lastName: 'Kennedy', middleInitial: 'L', married: [ 'Victoria D. Gifford' ], divorced: [  ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'February 27, 1958 -- December 31, 1997', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_6_7.1.jpg', text: "Michael Kennedy was the head of his brother Joe's Citizens Energy Corporation and also helped manage his uncle Ted Kennedy's Senate campaign in 1994. An alleged affair with his family's babysitter was reported in 1997. Kennedy died later that year in a skiing accident in Colorado." },
{ uri: 'Victoria D. Gifford', label: 'Victoria D. Gifford', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Victoria', lastName: 'Gifford', middleInitial: 'D', married: [ 'Michael L. Kennedy' ], divorced: [  ], birthDeath: 'February 20, 1957 --' },
{ uri: 'Mary K. Kennedy', label: 'Mary K. Kennedy', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Mary', lastName: 'Kennedy', middleInitial: 'K', married: [ 'Andrew M. Cuomo' ], divorced: [  ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'September 8, 1959 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_7_7.1.jpg', text: "Mary Kerry Kennedy Cuomo, an advocate for human rights for over 20 years, established the Robert F. Kennedy Center for Human Rights in 1987. She is the Chairman of the Board for Speak Truth to Power, a human rights advocacy group, named after her book of the same name. She and her husband have three daughters." },
{ uri: 'Andrew M. Cuomo', label: 'Andrew M. Cuomo', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Andrew', lastName: 'Cuomo', middleInitial: 'M', married: [ 'Mary K. Kennedy' ], divorced: [  ], birthDeath: 'December 6, 1967 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_7.1_7.1.jpg', text: "Andrew Cuomo founded Housing Enterprise for the Less Priviliged (HELP) in 1986 and served as the U.S. Secretary of Housing and Urban Development (HUD) from 1997 until 2001. He campaigned unsuccessfully for the Democratic nomination for governor of New York, a position held by his father Mario Cuomo from 1983 until 1995." },
{ uri: 'Christopher G. Kennedy', label: 'Christopher G. Kennedy', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Christopher', lastName: 'Kennedy', middleInitial: 'G', married: [ 'Sheila S. Berner' ], divorced: [  ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'July 4, 1963 --' },
{ uri: 'Sheila S. Berner', label: 'Sheila S. Berner', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Sheila', lastName: 'Berner', middleInitial: 'S', married: [ 'Christopher G. Kennedy' ], divorced: [  ], birthDeath: 'December 4, 1962 --' },
{ uri: 'Matthew M.T. Kennedy', label: 'Matthew M.T. Kennedy', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Matthew', lastName: 'Kennedy', middleInitial: 'M.T', married: [ 'Victoria A. Stauss' ], divorced: [  ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'January 11, 1965 --' },
{ uri: 'Victoria A. Stauss', label: 'Victoria A. Stauss', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Victoria', lastName: 'Stauss', middleInitial: 'A', married: [ 'Matthew M.T. Kennedy' ], divorced: [  ], birthDeath: 'February 10, 1964 --' },
{ uri: 'Douglas H. Kennedy', label: 'Douglas H. Kennedy', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Douglas', lastName: 'Kennedy', middleInitial: 'H', married: [ 'Molly E. Stark' ], divorced: [  ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'March 24, 1967 --' },
{ uri: 'Molly E. Stark', label: 'Molly E. Stark', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Molly', lastName: 'Stark', middleInitial: 'E', married: [ 'Douglas H. Kennedy' ], divorced: [  ] },
{ uri: 'Rory E.K. Kennedy', label: 'Rory E.K. Kennedy', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Rory', lastName: 'Kennedy', middleInitial: 'E.K', married: [ 'Mark Bailey' ], divorced: [  ], parents: [ 'Robert Kennedy', 'Ethel Skakel' ], birthDeath: 'December 12, 1968 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_11_7.1.jpg', text: "Rory Kennedy, born six months after her father's assassination, is an award-winning documentary filmmaker and producer. She also advocates for a number of social activism organizations." },
{ uri: 'Mark Bailey', label: 'Mark Bailey', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Mark', lastName: 'Bailey', married: [ 'Rory E.K. Kennedy' ], divorced: [  ] },
{ uri: 'Stephen E. Smith, Jr.', label: 'Stephen E. Smith, Jr.', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Stephen', lastName: 'Smith', middleInitial: 'E', suffix: 'Jr.', married: [  ], divorced: [  ], parents: [ 'Stephen E. Smith', 'Jean A. Kennedy' ], birthDeath: 'June 28, 1957 --' },
{ uri: 'William K. Smith', label: 'William K. Smith', type: 'Person', gender: 'male', generation: '3rd', firstName: 'William', lastName: 'Smith', middleInitial: 'K', married: [  ], divorced: [  ], parents: [ 'Stephen E. Smith', 'Jean A. Kennedy' ], birthDeath: 'September 4, 1960 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_2_8.1.jpg', text: "William Kennedy Smith made headlines when he was accused of committing rape in Palm Beach in 1991. He was acquitted after a nationally-televised trial. Smith became a practicing doctor." },
{ uri: 'Amanda M. Smith', label: 'Amanda M. Smith', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Amanda', lastName: 'Smith', middleInitial: 'M', married: [ 'Cart H. Hood' ], divorced: [  ], parents: [ 'Stephen E. Smith', 'Jean A. Kennedy' ], birthDeath: 'April 30, 1967 --' },
{ uri: 'Cart H. Hood', label: 'Cart H. Hood', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Cart', lastName: 'Hood', middleInitial: 'H', married: [ 'Amanda M. Smith' ], divorced: [  ] },
{ uri: 'Kym M. Smith', label: 'Kym M. Smith', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Kym', lastName: 'Smith', middleInitial: 'M', married: [ 'Alfred Tucker' ], divorced: [  ], parents: [ 'Stephen E. Smith', 'Jean A. Kennedy' ], birthDeath: 'November 29, 1972 --' },
{ uri: 'Alfred Tucker', label: 'Alfred Tucker', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Alfred', lastName: 'Tucker', married: [ 'Kym M. Smith' ], divorced: [  ], birthDeath: 'May 30, 1967 --' },
{ uri: 'Kara A. Kennedy', label: 'Kara A. Kennedy', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Kara', lastName: 'Kennedy', middleInitial: 'A', married: [ 'Michael Allen' ], divorced: [  ], parents: [ 'Edward M. Kennedy', 'Virginia J. Bennett' ], birthDeath: 'February 27, 1960 --' },
{ uri: 'Michael Allen', label: 'Michael Allen', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Michael', lastName: 'Allen', married: [ 'Kara A. Kennedy' ], divorced: [  ], birthDeath: '1958 --' },
{ uri: 'Edward M. Kennedy, Jr.', label: 'Edward M. Kennedy, Jr.', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Edward', lastName: 'Kennedy', middleInitial: 'M', suffix: 'Jr.', married: [ 'Katherine Gershman' ], divorced: [  ], parents: [ 'Edward M. Kennedy', 'Virginia J. Bennett' ], birthDeath: 'September 26, 1961 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_2_9.1.jpg', text: "Edward M. Kennedy, Jr. is the co-founder and president of the Marwood Group, a business development firm." },
{ uri: 'Katherine Gershman', label: 'Katherine Gershman', type: 'Person', gender: 'female', generation: '3rd', firstName: 'Katherine', lastName: 'Gershman', married: [ 'Edward M. Kennedy, Jr.' ], divorced: [  ], birthDeath: 'June 9, 1959 --' },
{ uri: 'Patrick J. Kennedy', label: 'Patrick J. Kennedy', type: 'Person', gender: 'male', generation: '3rd', firstName: 'Patrick', lastName: 'Kennedy', middleInitial: 'J', married: [  ], divorced: [  ], parents: [ 'Edward M. Kennedy', 'Virginia J. Bennett' ], birthDeath: 'July 14, 1967 --', image: 'http://www.pbs.org/wgbh/amex/kennedys/sfeature/images/sf_tree_3_3_9.1.jpg', text: "Patrick Kennedy became the youngest Kennedy family member to win office when he won a seat in the Rhode Island House of Representatives in 1988, at age 21." }
    ];

    types['Person'] = {
        label:          "Person",
        pluralLabel:    "People"
    };
    
    properties['gender'] = {
        label:          "gender",
        pluralLabel:    "gender",
        groupingLabel:  "gender",
        isLiteral:      true,
        canReverse:     false
    };
    properties['firstName'] = {
        label:          "first name",
        pluralLabel:    "first name",
        groupingLabel:  "first name",
        canDisplay:     false,
        isLiteral:      true,
        canReverse:     false
    };
    properties['lastName'] = {
        label:          "last name",
        pluralLabel:    "last name",
        groupingLabel:  "last name",
        canDisplay:     false,
        isLiteral:      true,
        canReverse:     false
    };
    properties['middleInitial'] = {
        label:          "middle initial",
        pluralLabel:    "middle initial",
        groupingLabel:  "middle initial",
        canDisplay:     false,
        isLiteral:      true,
        canReverse:     false,
        canFacet:       false,
        canGroup:       false
    };
    properties['suffix'] = {
        label:          "suffix",
        pluralLabel:    "suffix",
        groupingLabel:  "suffix",
        canDisplay:     false,
        isLiteral:      true,
        canReverse:     false,
        canFacet:       false,
        canGroup:       false
    };
    properties['generation'] = {
        label:          "generation",
        pluralLabel:    "generation",
        groupingLabel:  "generation",
        isLiteral:      true,
        canReverse:     false
    };
    properties['birthDeath'] = {
        label:          "birth/death",
        pluralLabel:    "birth/death",
        isLiteral:      true,
        canReverse:     false,
        canFacet:       false,
        canGroup:       false
    };
    properties['image'] = {
        label:          "image",
        pluralLabel:    "image",
        isLiteral:      true,
        canReverse:     false,
        canFacet:       false,
        canGroup:       false
    };
    properties['text'] = {
        label:          "text",
        pluralLabel:    "text",
        isLiteral:      true,
        canReverse:     false,
        canFacet:       false,
        canGroup:       false
    };
    properties['married'] = {
        label:                  "married to",
        pluralLabel:            "married to",
        groupingLabel:          "spouses",
        isLiteral:              false,
        canReverse:             false,
        canSlide:               true
    };
    properties['divorced'] = {
        label:                  "divorced",
        pluralLabel:            "divorced",
        groupingLabel:          "whom they divorced",
        isLiteral:              false,
        canReverse:             false,
        canSlide:               true
    };
    properties['parents'] = {
        label:                  "is a child of",
        pluralLabel:            "are children of",
        reverseLabel:           "is a parent of",
        reversePluralLabel:     "are parents of",
        groupingLabel:          "parents",
        reverseGroupingLabel:   "children",
        isLiteral:              false,
        canReverse:             true
    };
console.time("database");
    g_database = new Rubik.Database(objects);
console.timeEnd("database");    
console.time("database-root");
    var rootObjectSet = g_database.getSubjects('Person', 'type');
console.timeEnd("database-root");

console.time("queryengine");
    g_queryEngine = new Rubik.QueryEngine(
        g_database, 
        types, 
        properties, 
        rootObjectSet
    );

    g_browser = new Rubik.Browser(
        g_database, 
        g_queryEngine, 
        document.getElementById("control-panel"),
        document.getElementById("browse-panel"),
        document.getElementById("view-panel")
    );
    hideStatus();
console.timeEnd("queryengine");
}
