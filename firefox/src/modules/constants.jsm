var EXPORTED_SYMBOLS = ["serverTypeList", "autoAnswerList", "css", "xpath", "tagsOfInterest"];


const
serverTypeList = [
{
    type :"Astmanproxy",
    description :"Astmanproxy"
},
{
    type :"AJAM",
    description :"AJAM (Asterisk 1.4+)"
},
{
    type :"NJVision",
    description :"Noojee Vision"
} ];


const
autoAnswerList = [
{
    manufacturer :"Aastra",
    header :"Call-Info:\\\\; answer-after=0"
},
{
    manufacturer :"GrandStream",
    header :"Call-Info:\\\\; answer-after=0"
},
{
    manufacturer :"Linksys",
    header :"Call-Info:\\\\; answer-after=0"
},
{
    manufacturer :"Polycom",
    header :"Alert-Info: Ring Answer"
},
{
    manufacturer :"Snom",
    header :"Call-Info:\\\\; answer-after=0"
},
{
    manufacturer :"Yealink",
    header :"Call-Info:\\\\; answer-after=0"
}
];

// Not actually used except as a flag to tell us we have already initialized the
// page.
const
css = ".NoojeeClickInstalled { }";

// List of tags whose children we will scan looking for phone numbers
const
tagsOfInterest = [ "a", "abbr", "acronym", "address", "applet", "b", "bdo",
		"big", "blockquote", "body", "caption", "center", "cite", "code", "dd",
		"del", "div", "dfn", "dt", "em", "fieldset", "font", "form", "h1",
		"h2", "h3", "h4", "h5", "h6", "i", "iframe", "ins", "kdb", "li",
		"object", "pre", "p", "q", "samp", "small", "span", "strike", "s",
		"strong", "sub", "sup", "td", "th", "tt", "u", "var" ];

var xpath = "//text()[(parent::" + tagsOfInterest.join(" or parent::") + ")]";

