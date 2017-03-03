/* ************************************************************************** 
 * Mini JavaScript-Only CMS - Engine
 * ************************************************************************** */
function start()
{
	drawHeader();
	navigate();
}

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

function navigate()
{
	var cntnr = window.document.getElementById('main');
	
	var url = window.location.href;
	var pageid = null;
	if(url.lastIndexOf('?')!=-1)
		pageid = url.substring(url.lastIndexOf('?')+1);
	else
		pageid = site.indexpage;
	
	if(pageid=='map')			// --> Map: all pages, in chronological ord.
	{
		cntnr.innerHTML = 'Generate site map... (pending)'
	}
	else if(pageid=='last')		// --> Last: last page added
	{
		cntnr.innerHTML = 'Go to last page added... (pending)'
	}
	else if(pageid=='random')	// --> Random page
	{
		cntnr.innerHTML = 'Go to random page... (pending)'
	}
	else						// --> Selected page
	{
		for(var i = 0; i<site.pages.length; i++)
		{
			if(site.pages[i].pageid==pageid)
			{
				document.title = 'a-zz :: ' + site.pages[i].title;
				cntnr.innerHTML = 'Added / updated: ' + site.pages[i].date + '<object type="text/html" data="content/html/' + site.pages[i].content + '" class="cntnr-html"></object>';					
				break;
			}
		}
	}
}
/* ************************************************************************** */
