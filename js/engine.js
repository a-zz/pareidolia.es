/* ************************************************************************** 
 * Mini JavaScript-Only CMS - Engine
 * (non fully-standard JavaScript notation, sorry!) 
 * ************************************************************************** */

// This function should be fired on body.onload()!
function start()
{
	addSiteMeta();
	renderHeader();
	renderFooter();
	navigate();
	window.addEventListener('resize', adjustContentHeight);
}

// Add site metadata
// Arguments: 
//	(none)
// Returns:
//	(nothing) 
function addSiteMeta()
{
	for(var i = 0; i<site.meta.length; i++)
	{
		var meta = document.createElement("meta");
		meta.httpEquiv = site.meta[i].httpEquiv;
		meta.content = site.meta[i].content;
		document.getElementsByTagName('head')[0].appendChild(meta);
	}
}

// Navigate to some content (referred in the URL)
// Arguments: 
//	(none)
// Returns:
//	(nothing) 
function navigate()
{	
	var url = window.location.href;
	var pageId = null;
	if(url.lastIndexOf('?')!=-1)
		pageId = url.substring(url.lastIndexOf('?')+1);
	else
		pageId = site.indexpage;
	
	if(pageId.startsWith('~map'))	// --> Map: all pages
	{
		renderSiteMap(pageId.substring(5));
	}
	else if(pageId=='~last')		// --> Last: last page added
	{
		renderPage(findLastPage());
	}
	else if(pageId=='~random')		// --> Random page
	{
		renderPage(randomPage());
	}
	else							// --> Selected page
		renderPage(pageId);
}

/* ** Content-rendering functions ******************************************* */

// Renders the site header (logo and menu so far).
// Arguments: 
//	(none)
// Returns:
//	(nothing)
function renderHeader()
{
	// Draw the logo (site name & description)
	var hdrlogo = window.document.getElementById('hdrlogo');
	hdrlogo.innerHTML = '<a href="index.html">' + site.name + '</a> ' + site.description + '$ <span class="cursor">&#x2589;</span>';
		
	// Draw the site menu
	var hdrmenu = window.document.getElementById('hdrmenu');
	var innerHTML = 'Go to: <a href="index.html?~map" title="Page index (site map)" class="hdrmenu">Index</a> | <a href="index.html?~last" title="Last page added" class="hdrmenu">Last</a> | <a href="index.html?~random" title="Random page" class="hdrmenu">Random</a>';	
	for(var i = 0; i<site.menu.length; i++)
		innerHTML += ' ·&nbsp<a href="' + (site.menu[i].pageid!=null?"index.html?" + site.menu[i].pageid:site.menu[i].exturl) + '" title="' + site.menu[i].title + '" class="hdrmenu" id="' + site.menu[i].menuid + '">' + site.menu[i].text + '</a>';
	
	innerHTML += '<br/>Main tags:';
	var tagList = getSiteTagListByContent(3);
	for(var i = 0; i<tagList.length; i++)
		innerHTML += renderTag(tagList[i], false, false);
		
	hdrmenu.innerHTML = innerHTML;
}

function renderFooter()
{
	// Draw the logo (site name & description)
	var ftr = window.document.getElementById('cntnr-ftr');
	ftr.innerHTML = '<a href="index.html">' + site.name + ' :: ' + site.description + '</a>, ' + lastUpdateYear();
}

// Render a content page
// Arguments:
//	pageId (String) The page to load, referred by its id (field pageid in 
//		metadata.json > site > pages).
// Returns:
//	(nothing)
function renderPage(pageId)
{
	var cntnr = window.document.getElementById('main');

	var page = findPageById(pageId);
	var tagLinks = '';
	var tagList = page.tags.split(';');
	for(var j = 0; j<tagList.length; j++)
		tagLinks += renderTag(tagList[j], false, false);
	
	document.title = site.name + ' :: ' + page.title;
	cntnr.innerHTML = '<div class="page-hdr">' + page.title + ' (' + formatDate(page.date) + ')' +
					  (tagLinks!=''?' ' + tagLinks:'') + '</div>' +
					  '<object type="text/html" data="content/html/' + page.content + '" class="cntnr-html" id="cntnr-html" onload="adjustContentHeight();"></object>';
}

// Render the site map
// Arguments:
//	selectedTag (String) Filter contents by tag (optional)
// Returns:
//	(nothing)
function renderSiteMap(selectedTag)
{
	var cntnr = window.document.getElementById('main');
	document.title = site.name + ' :: All pages (site map)';
	
	var tagList = getSiteTagList();	
	var cntntHTML  = '';
	cntntHTML += '<div class="cntnr-tags"><h2>All contents by: Tags</h2>';
	for(var i = 0; i<tagList.length; i++)
		cntntHTML += renderTag(tagList[i], tagList[i]==selectedTag, true);
	cntntHTML += '</div>';
	
	cntntHTML += '<br/>';
	var history = getSiteHistory(selectedTag);
	cntntHTML += '<div class="cntnr-history"><h2>All contents by: History' + (selectedTag!=''?' (filtered)':'') + '</h2><ul>';
	for(var i = 0; i<history.length; i++)
	{
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
function renderTag(tag, selected, showNoTag)
{
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
function findPageById(pageId)
{
	for(var i = 0; i<site.pages.length; i++)
		if(site.pages[i].pageid==pageId)
			return site.pages[i];
}

// Find the last content page (by field date in metadata.json > site > pages) 
// Arguments:
//	(none)
// Returns:
//	(String) The last page id (field pageid in metadata.json > site > pages).
function findLastPage()
{
	var lastDate = 0;
	var lastPageId = null;
	for(var i = 0; i<site.pages.length; i++)
	{
		if(site.pages[i].date>lastDate)
		{
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
function randomPage()
{
	return site.pages[Math.floor(Math.random() * site.pages.length)].pageid;
}

// Retrieve all page tags in alphabetical order
// Arguments:
// 	(none)
// Returns:
// 	(Array) A list of tags
function getSiteTagList()
{
	var tagList = new Array();
	
	for(var i = 0; i<site.pages.length; i++)
	{
		var pageTags = site.pages[i].tags.split(';');
		for(var j = 0; j<pageTags.length; j++)
		{
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
function getSiteTagListByContent(n)
{
	// TODO Not implemented yet! Temporary code:
	return getSiteTagList();
}

// Retrieve all pages in reverse chronological order
// Arguments:
//	selectedTag (String) Show only pages related to a certain tag
// Returns:
//	(Array) An array of "page" elements (as defined in metadata.json > site)
function getSiteHistory(selectedTag)
{
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

function lastUpdateYear()
{
	var currentYear = new Date().getFullYear();
	var lastYear = 1972;
	for(var i = 0; i<site.pages.length; i++)
	{
		if(site.pages[i].date.substring(0, 4)==currentYear)			
			return currentYear;
		else if(site.pages[i].date.substring(0, 4)>lastYear)
			lastYear = site.pages[i].substring(0, 4);
	}
		
	return lastYear;
}

/* ** Utility functions ***************************************************** */

// Format date in a human readable fashion 
// Arguments:
// 	date (String) The date in yyyymmddhhmi format
// Returns:
//	(String) The date formatted
function formatDate(date)
{
	return date.substring(0, 4) + '-' +
		   date.substring(4, 6) + '-' +
		   date.substring(6, 8) + ' ' +
		   date.substring(8, 10) + ':' +
		   date.substring(10);
}

/* ** Event handling ******************************************************** */
function adjustContentHeight()
{
	var cntnr = window.document.getElementById('cntnr-html');
	
	// FIXME Avoid the 1.1; find why is that extra height needed
	cntnr.style.height = (1.1 * cntnr.contentDocument.body.offsetHeight) + 'px';
}
/* ************************************************************************** */
