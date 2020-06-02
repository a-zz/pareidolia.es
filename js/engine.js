/* ************************************************************************** 
 * bravas: Mini JavaScript-Only CMS - Engine                                +
 * ************************************************************************** */

// This function should be fired on body.onload()!
function start() {
	
	addSiteMeta();
	renderHeader();
	renderFooter();
	var currentPageId = navigate();
	addEventListeners();
    start3rdPartyComponents(currentPageId);
}

// Add site metadata
// Arguments: 
//	(none)
// Returns:
//	(nothing) 
function addSiteMeta() {
	
	for(var i = 0; i<site.meta.length; i++)
	{
		var meta = document.createElement('meta');
		meta.httpEquiv = site.meta[i].httpequiv;
		meta.content = site.meta[i].content;
		document.getElementsByTagName('head')[0].appendChild(meta);
	}
}

// Navigate to some content (referred in the URL)
// Arguments: 
//	(none)
// Returns:
//	(nothing) 
function navigate() {
	
	var url = window.location.href;
	var pageId = null;
	var anchor = null;
	if(url.lastIndexOf('?')!=-1) {
		pageId = url.substring(url.lastIndexOf('?')+1);
		var hash = pageId.lastIndexOf('#');
		if(hash!=-1) {
			anchor = pageId.substring(hash+1);
			pageId = pageId.substring(0, hash);
		}
	}
	else
		pageId = site.indexpage;
	
    var currentPageId = null;
	if(pageId.startsWith('~map'))	// --> Map: all pages
		renderSiteMap(pageId.substring(5));
	else if(pageId=='~last') {		// --> Last: last page added
        currentPageId = findLastPage();
		renderPage(currentPageId);
    }
	else if(pageId=='~random') {	// --> Random page
        currentPageId = randomPage();
		renderPage(currentPageId);
    }
	else {							// --> Selected page
        currentPageId = pageId;
		renderPage(pageId, anchor);
    }
    
    return currentPageId;
}

/* ** Content-rendering functions ******************************************* */

// Renders the site header (logo and menu so far).
// Arguments: 
//	(none)
// Returns:
//	(nothing)
function renderHeader() {
	
	// Draw the logo (site name & description)
	var hdrlogo = window.document.getElementById('hdrlogo');
	var asciiname = '';
	asciiname += '<a href="index.html">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;__&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;___<br/>';
	asciiname += '&nbsp;&nbsp;&nbsp;___&nbsp;&nbsp;___&nbsp;________&nbsp;(_)__/&nbsp;/__&nbsp;&nbsp;/&nbsp;(_)__&nbsp;_&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;___&nbsp;___<br/>';
	asciiname += '&nbsp;&nbsp;/&nbsp;_&nbsp;\\/&nbsp;_&nbsp;`/&nbsp;__/&nbsp;-_)&nbsp;/&nbsp;_&nbsp;&nbsp;/&nbsp;_&nbsp;\\/&nbsp;/&nbsp;/&nbsp;_&nbsp;`/&nbsp;_&nbsp;&nbsp;/&nbsp;-_|_-&lt;<br/>';
	asciiname += '&nbsp;/&nbsp;.__/\\_,_/_/&nbsp;&nbsp;\\__/_/\\_,_/\\___/_/_/\\_,_/&nbsp;(_)&nbsp;\\__/___/<br/>';
	asciiname += '/_/</a>&nbsp;';
	hdrlogo.innerHTML = asciiname + ' ' + site.description + '$ <span class="cursor">&#x2589;</span>';
		
	// Draw the site menu
	var hdrmenu = window.document.getElementById('hdrmenu');
	var innerHTML = 'Go to: <a href="index.html?~map" title="Page index (site map)" class="hdrmenu">Index</a> | <a href="index.html?~last" title="Last page added" class="hdrmenu">Last</a> | <a href="index.html?~random" title="Random page" class="hdrmenu">Random</a>';	
	for(var i = 0; i<site.menu.length; i++)
		innerHTML += ' ·&nbsp<a href="' + (site.menu[i].pageid!=null?"index.html?" + site.menu[i].pageid:site.menu[i].exturl) + '" title="' + site.menu[i].title + '" class="hdrmenu" id="' + site.menu[i].menuid + '">' + site.menu[i].text + '</a>';
	
	innerHTML += '<br/>Top tags:';
	var tagList = getSiteTagListByContent(3);
	for(var i = 0; i<tagList.length; i++)
		innerHTML += renderTag(tagList[i], false, false);
		
	hdrmenu.innerHTML = innerHTML;
}

// Renders the site footer (not too much to show).
// Arguments: 
//  (none)
// Returns:
//	(nothing)
function renderFooter() {
	
	// Draw the logo (site name & description)
	var ftr = window.document.getElementById('cntnr-ftr');
	ftr.innerHTML = '<a href="index.html">' + site.name + ' :: ' + site.description + '</a>, ' + lastUpdateYear();
}

// Render a content page. If the content has a Javascript function 
//  startContentScript(), it'll be invoked just afterwards, so per-page
//  content-specific scripts may be added.
// Arguments:
//	pageId (String) The page to load, referred by its id (field pageid in 
//		metadata.json > site > pages).
//	anchor (String) Local anchor (#something) within the page
// Returns:
//	(nothing)
function renderPage(pageId, anchor) {
	
	var cntnr = window.document.getElementById('main');

	var page = findPageById(pageId);
	var tagLinks = '';
	var tagList = page.tags.split(';');
	for(var j = 0; j<tagList.length; j++)
		tagLinks += renderTag(tagList[j], false, false);
	
	document.title = site.name + ' :: ' + page.title;
	cntnr.innerHTML = '<div class="page-hdr">' + page.title + ' (' + formatDate(page.date) + ')' +
					  (tagLinks!=''?' ' + tagLinks:'') + '</div>' +
					  '<div class="cntnr-html" id="cntnr-html"></div>';
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) 
            if(page.content.endsWith('.html')) {
                showHtmlContent(document.getElementById("cntnr-html"), this.responseText, anchor);                
                window.document.getElementById('cntnr-html').querySelectorAll('script').forEach((contentScript) => {
                    var pageScript = document.createElement('script');
                    pageScript.appendChild(document.createTextNode(contentScript.text));
                    window.document.body.appendChild(pageScript);
                });
                if(typeof startContentScript === 'function')
                startContentScript();                                
            }
            else if(page.content.endsWith('.md'))
                showMdContent(document.getElementById("cntnr-html"), this.responseText);
	};
    if(page.content.endsWith('.html'))
        xhttp.open("GET", 'content/html/' + page.content + '?' + new Date().getTime(), true);
    else if(page.content.endsWith('.md'))
        xhttp.open("GET", 'content/md/' + page.content + '?' + new Date().getTime(), true);
    xhttp.send();
}

// Writes the HTML content to target DIV
// Arguments:
//	target (HTMLDivElement) The DIV element to write the content to
//  content (String) The HTML content to be written
//	anchor (String) Local anchor (#something) within the content.
//		Needed as local-link handling isn't clear, or seems to be not completely 
//		coherent (unless on Firefox Developer Edition 65). They seem to work
//		fine when first loaded, but not always on page reload. To avoid that we
//		will be scrolling by javascript to the local anchor offset when needed.
// Returns:
//	(nothing)
function showHtmlContent(target, content, anchor) {
	
	target.innerHTML = content;
    renderToc(target);
	if(anchor!=null) {
		// TODO Find anchor offset within content and scroll
	}
}

// Renders MD content as HTML and writes it to target DIV
// Arguments:
//	target (HTMLDivElement) The DIV element to write the content to
//  content (String) The MD content to be conversed and written
//	anchor (String) Local anchor (#something) within the content.
//		Needed as local-link handling isn't clear, or seems to be not completely 
//		coherent (unless on Firefox Developer Edition 65). They seem to work
//		fine when first loaded, but not always on page reload. To avoid that we
//		will be scrolling by javascript to the local anchor offset when needed.
// Returns:
//	(nothing)
function showMdContent(target, content) {
    
    var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			eval(this.responseText);
            var md = new Remarkable();
            var html = md.render(content);
            showHtmlContent(target, html, null);
            renderToc(target);
		}
	};
	xhttp.open("GET", 'js/remarkable.min.js', true);
	xhttp.send();
}    

// Renders a table of contents (TOC) for the page. The TOC is placed where a
//  paragraph containing the token //TOC// (i.e. <p>//TOC//</p>) is found; if
//  more than one are found, only the first one is used; the TOC is not rendered
//  otherwise. The TOC is built from <h2> headers.
// Arguments:
//  contentDiv (HTMLDivElement) The DIV holding the page content (and maybe the 
//      TOC placeholder).
// Returns:
//  (nothing)
function renderToc(contentDiv) {
 
    var tocParagraph = null;
    var ps = contentDiv.querySelectorAll('p');
    for(var i = 0; i<ps.length; i++) {
        if(ps[i].textContent=='//TOC//') {
            tocParagraph = ps[i];
            break;
        }
    }
    if(tocParagraph!=null) {
        tocParagraph.textContent = '';
        var tocHTML = '<ol id="toc">';
        var tocTargetIndex = 0;
        contentDiv.querySelectorAll('h2').forEach((header) => {
            tocTargetIndex++;
            header.id = 'tocTarget' + tocTargetIndex;
            tocHTML += '<li><a href="#tocTarget' + tocTargetIndex + '">' + header.textContent + '</a></li>';
        });
        tocHTML += '</ol>';
        tocParagraph.innerHTML = tocHTML;
    }    
}

// Render the site map
// Arguments:
//	selectedTag (String) Filter contents by tag (optional)
// Returns:
//	(nothing)
function renderSiteMap(selectedTag) {
	
	var cntnr = window.document.getElementById('main');
	document.title = site.name + ' :: All pages (site map)';
	
	var tagList = getSiteTagList();	
	var cntntHTML  = '';
	cntntHTML += '<div class="cntnr-tags"><h2>All contents by: Tags</h2>';
	cntntHTML += '<a href="index.html?~map" class="tag">(all)</a>';
	for(var i = 0; i<tagList.length; i++)
		cntntHTML += renderTag(tagList[i], tagList[i]==selectedTag, true);
	cntntHTML += '</div>';
	
	cntntHTML += '<br/>';
	var history = getSiteHistory(selectedTag);
	cntntHTML += '<div class="cntnr-history"><h2>All contents by: History' + (selectedTag!=''?' (filtered)':'') + '</h2><ul>';
	for(var i = 0; i<history.length; i++) {
		cntntHTML += '<li>(' + formatDate(history[i].date) + ') <a href="index.html?' + history[i].pageid + '" class="page-title">' + history[i].title + '</a> ';
		var pageTags = history[i].tags.split(';');
		for(var j =0; j<pageTags.length; j++)
			cntntHTML += renderTag(pageTags[j], false);
		cntntHTML += '<br/><span class="page-description">' + history[i].description + '</span></li>';
	}	
	cntntHTML += '</ul></div>';
	
	cntnr.innerHTML = cntntHTML;
}

// Render a tag link
// Arguments:
//	tag (String) The tag to generate
//	selected (boolean) Show as selected (include "selected" CSS class)
//	showNoTag (boolean) True to show empty tags as "(no tag)"; false to hide
// Returns:
//	(String) HTML code to render a tag
function renderTag(tag, selected, showNoTag) {
	
	if(tag!='' || showNoTag)
		return '<a href="index.html?~map-' + tag + '" class="tag' + (selected?' selected':'') + '">' + (tag!=''?tag:'(no tag)') + '</a>';
	else 
		return '';
}

/* ** Site metadata query functions ***************************************** */

// Find a page by its id 
// Arguments:
//	pageId (String) The page id (field pageid in metadata.json > site > pages).
// Return:
//	(object) The "page" object.
function findPageById(pageId) {
	
	for(var i = 0; i<site.pages.length; i++)
		if(site.pages[i].pageid==pageId)
			return site.pages[i];
}

// Find the last content page (by field date in metadata.json > site > pages) 
// Arguments:
//	(none)
// Returns:
//	(String) The last page id (field pageid in metadata.json > site > pages).
function findLastPage() {
	
	var lastDate = 0;
	var lastPageId = null;
	for(var i = 0; i<site.pages.length; i++) {
		if(site.pages[i].date>lastDate) {
			lastDate = site.pages[i].date;
			lastPageId = site.pages[i].pageid; 
		}
	}
	
	return lastPageId;
}

// Find a random page
// Arguments:
// 	(none)
// Returns:
// 	(String) The last page id (field pageid in metadata.json > site > pages).
function randomPage() {
	
	return site.pages[Math.floor(Math.random() * site.pages.length)].pageid;
}

// Retrieve all page tags in alphabetical order
// Arguments:
// 	(none)
// Returns:
// 	(Array) A list of tags
function getSiteTagList() {
	
	var tagList = new Array();
	
	for(var i = 0; i<site.pages.length; i++) {
		var pageTags = site.pages[i].tags.split(';');
		for(var j = 0; j<pageTags.length; j++) {
			if(tagList.indexOf(pageTags[j])==-1)
				tagList.push(pageTags[j]);
		}
	}
	tagList.sort();
	
	return tagList;
}

// Retrieve top page tags (per page number) 
// Arguments:
//	n (int) Show only the top n tags 
// Returns:
//	(Array) A list of tags
function getSiteTagListByContent(n) {
	
	var topTags = new Array();
	var tagCounters = new Array();
	var tagList = getSiteTagList();
	
	// Counting pages by tag
	for(var i = 0; i<tagList.length; i++) {
		if(tagList[i]=='')
			continue; // Only interested in non-empty tags
		topTags.push(tagList[i]);
		tagCounters.push(getSiteHistory(tagList[i]).length);
	}
	
	// Sorting by page count
	var stillUnsorted = true;
	while(stillUnsorted) {
		stillUnsorted = false;
		for(var i = 0; i<topTags.length-1; i++) {
			if(tagCounters[i]<tagCounters[i+1]) {
				var tag = topTags[i+1];
				var counter = tagCounters[i+1];
				topTags[i+1] = topTags[i];
				tagCounters[i+1] = tagCounters[i];
				topTags[i] = tag;
				tagCounters[i] = counter;
				stillUnsorted = true;
				continue;
			}
		}
	}
	
	// Returning the first n tags	
	return topTags.slice(0, n);
}

// Retrieve all pages in reverse chronological order
// Arguments:
//	selectedTag (String) Show only pages related to a certain tag
// Returns:
//	(Array) An array of "page" elements (as defined in metadata.json > site)
function getSiteHistory(selectedTag) {
	
	selectedTag = decodeURI(selectedTag);
	var history = new Array();
	
	var ordrdPageIds = new Array();
	for(var i = 0; i<site.pages.length; i++)
		if(selectedTag==null || site.pages[i].tags.indexOf(selectedTag)!=-1)
			ordrdPageIds.push(site.pages[i].date + '#' + site.pages[i].pageid);
	ordrdPageIds.sort();
	
	for(var i = ordrdPageIds.length-1; i>=0; i--)
		history.push(findPageById(ordrdPageIds[i].split('#')[1]));
	
	return history;
}

// Returns the (content's) last update year (i.e. the year of the last content
//  page, as set by page.date)
// Arguments:
//  (none)
// Returns:
//  (Integer) The year of the last content page
function lastUpdateYear() {
	
	var currentYear = new Date().getFullYear();
	var lastYear = 1972;
	for(var i = 0; i<site.pages.length; i++) {
		if(site.pages[i].date.substring(0, 4)==currentYear)			
			return currentYear;
		else if(site.pages[i].date.substring(0, 4)>lastYear)
			lastYear = site.pages[i].date.substring(0, 4);
	}
		
	return lastYear;
}

/* ** Utility functions ***************************************************** */

// Format date in a human readable fashion 
// Arguments:
// 	date (String) The date in yyyymmddhhmi format
// Returns:
//	(String) The date formatted
function formatDate(date) {
	
	return date.substring(0, 4) + '-' +
		   date.substring(4, 6) + '-' +
		   date.substring(6, 8) + ' ' +
		   date.substring(8, 10) + ':' +
		   date.substring(10);
}

// Returns the canonical URL for a certain pageId, needed by some 3rd party
//  components
// Arguments:
//	pageId (String) The pageId
// Returns:
//  (String) The canonical URL for the page

function getCanonicalUrl(pageId) {
      
    if(pageId!=null) {
        var url = window.location.href;
        url = url.substring(0, url.lastIndexOf('/')) + '/index.html?' + pageId;
        return url;
    }
    else
        return null;
}

/* ** Event handling ******************************************************** */
function addEventListeners() {

	// (currently none)
}

/* ** 3rd party components ************************************************** */
var disqusPageIdentifier = null;
var disqusPageUrl = null;
function start3rdPartyComponents(currentPageId) {
    
    // Disqus
    disqusPageUrl = getCanonicalUrl(currentPageId);        
    if(disqusPageUrl!=null) {
        var d = document, s = d.createElement('script');
	s.src = 'https://pareidolia-es.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);    
        disqusPageIdentifier = currentPageId;
    }    
}

var disqus_config = function () {
    
    this.page.url = disqusPageUrl;
    this.page.identifier = disqusPageIdentifier;
};    

/* ************************************************************************** */
