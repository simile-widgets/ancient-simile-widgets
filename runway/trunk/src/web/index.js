var records = [
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f800000000a18182e?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Anatomy for the Artist",
        subtitle: "Sarah Simblet"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f800000000a1818ab?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "intern",
        subtitle: "Sandeep Jauhar"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/wikipedia/images/en_id/8855635?mode=fillcrop&maxheight=200&maxwidth=200",
        title:  "Interpreter of Maladies",
        subtitle: "Jhumpa Lahiri"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f800000000a181846?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Beautiful Evidence",
        subtitle: "Edward Tufte"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/wikipedia/images/en_id/2211822?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "A Painted House",
        subtitle: "John Grisham"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/wikipedia/images/en_id/17717249?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Crow Lake",
        subtitle: "Mary Lawson"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/wikipedia/images/en_id/2127826?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Freakonomics",
        subtitle: "Steven D. Levitt and Stephen J. Dubner"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/wikipedia/images/en_id/1451562?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Guns, Germs, and Steel",
        subtitle: "Jared Diamond"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f800000000a1818b7?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Lies My Teacher Told Me",
        subtitle: "James W. Loewen"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f800000000a1818c3?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Making Comics",
        subtitle: "Scott McCloud"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f800000000a1818ef?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Michelangelo and the Pope's Ceiling",
        subtitle: "Ross King"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f8000000009db3c83?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "The Brain that Changes Itself",
        subtitle: "Norman Doidge, M.D."
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f800000000a181937?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "The Lucifer Effect",
        subtitle: "Philip Zimbardo"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f800000000a181b6f?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "The Origin of Wealth",
        subtitle: "Eric D. Beinhocker"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/guid/9202a8c04000641f800000000a181ba8?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Traffic",
        subtitle: "Tom Vanderbilt"
    },
    {   image: "http://www.freebase.com/api/trans/image_thumb/wikipedia/images/en_id/15321403?mode=fillcrop&maxheight=200&maxwidth=200",
        title: "Waiting",
        subtitle: "Ha Jin"
    }
];

function onThemeChange(select) {
    var themeName = select.options[select.selectedIndex].value;
    var theme = Runway.themes[themeName];
    
    widget.setThemeName(themeName);
    
    document.body.style.backgroundColor = theme.bottomColor;
    document.body.className = "theme-" + themeName;
    document.getElementById("top-panel").style.backgroundColor = theme.topColor;
}