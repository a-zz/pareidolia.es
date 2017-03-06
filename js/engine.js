/* ************************************************************************** 
 * Mini JavaScript-Only CMS - Engine
 * ************************************************************************** */

// This function should be fired on body.onload()!
function start()
{
	drawHeader();
	navigate();
}

// Renders the site header (logo and menu so far).
// Arguments: 
//	(none)
// Returns:
//	(nothing)
function drawHeader()
{
	// Draw the logo (site name & description)
	var hdrlogo = window.document.getElementById('hdrlogo');
	hdrlogo.innerHTML = '<a href="index.html">' + site.name + '</a>&nbsp;' + site.description;
		
	// Draw the site menu
	var hdrmenu = window.document.getElementById('hdrmenu');
	var innerHTML = 'Go to:&nbsp;<a href="index.html?map" title="All pages (site map)" class="hdrmenu">All</a>&nbsp;|&nbsp;<a href="index.html?last" title="Last page added" class="hdrmenu">Last</a>&nbsp;|&nbsp;<a href="index.html?random" title="Random page" class="hdrmenu">Random</a>';	
	for(var i = 0; i<site.menu.length; i++)
		innerHTML += '&nbsp;·&nbsp<a href="' + (site.menu[i].pageid!=null?"index.html?" + site.menu[i].pageid:site.menu[i].exturl) + '" title="' + site.menu[i].title + '" class="hdrmenu" id="' + site.menu[i].menuid + '">' + site.menu[i].text + '</a>';
	hdrmenu.innerHTML = innerHTML;
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
	
	if(pageId=='map')			// --> Map: all pages, in chronological ord.
	{
		cntnr.innerHTML = 'Generate site map... (pending)'
	}
	else if(pageId=='last')		// --> Last: last page added
	{
		loadPage(findLastPage());
	}
	else if(pageId=='random')	// --> Random page
	{
		loadPage(randomPage());
	}
	else						// --> Selected page
		loadPage(pageId);
}

// Load a content page
// Arguments:
//	pageId (String) The page to load, referred by its id (field pageid in 
//		metadata.json > site > pages).
// Returns:
//	(nothing)
function loadPage(pageId)
{
	var cntnr = window.document.getElementById('main');

	for(var i = 0; i<site.pages.length; i++)
	{
		if(site.pages[i].pageid==pageId)
		{
			document.title = site.name + ' :: ' + site.pages[i].title;
			cntnr.innerHTML = 'Added / updated: ' + site.pages[i].date + '<object type="text/html" data="content/html/' + site.pages[i].content + '" class="cntnr-html"></object>';					
			break;
		}
	}
}

// Find the last content page
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
/* ************************************************************************** */
