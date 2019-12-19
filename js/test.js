/*
	http://touiteur.cefim-formation.org/
	http://touiteur.cefim-formation.org/list
	http://touiteur.cefim-formation.org/list?ts=
	http://touiteur.cefim-formation.org/send // post request
	
	http://touiteur.cefim-formation.org/likes/send
	http://touiteur.cefim-formation.org/likes/top
	http://touiteur.cefim-formation.org/likes/remove
	http://touiteur.cefim-formation.org/comments/list?message_id=1
	http://touiteur.cefim-formation.org/comments/send?message_id=1
	
	http://touiteur.cefim-formation.org/influencers?count=3
	http://touiteur.cefim-formation.org/trending
*/

const MAX_TOUITS = 10;
const TIMER = 1100;
const MAX_POP = 3;
const MAX_AUTH = 3;
const MAX_AUTH_TOUITS = 5;
const MAX_WORDS = 10;
const MIN_WORDS_LENGTH = 2;
const MAX_COMMENTS = 3;

let getRequest = 'http://touiteur.cefim-formation.org/list';
let listTouits = null;
let length = 0;
let listAuthor = [];
let listWord = {};
let sortText = [];
let listComment = {};
let lastElement = null;
let countElements = 1;
let nbrPages = 1;
let currentPage = 1;
const tabId = [];
const tabNotifs = [];

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

class Bot
{
	constructor()
	{
		this.botTag = '(bot) ';
		this.url = 'https://api.randomuser.me/';
		this.user = null;
		this.pseudo = null;
		this.msg = null;
		this.tabMatchesResponse =	[
										['/help', this.help],
										['/test', this.test],
										['/chat', this.neko],
										['//猫', this.neko],
										['/like', this.like],
										['/dislike', this.dislike],
										['/comment', this.comment],
										['/spam', this.spam]
									];
		this.thisLength = this.tabMatchesResponse.length;
		this.response = null;
//		document.getElementById('list-touits').addEventListener('DOMNodeInserted', this.userReader);
		console.log('I\'m a ready bot');
	}

	run()
	{
		this.getUser();
		this.userReader();
		this.getResponse();
		this.postResponse();
	}
	
	getUser()
	{
		const obj = this;
		const req = new XMLHttpRequest();
		req.open('GET', this.url, true);
		req.onreadystatechange = function () {
			if(req.readyState === 4 && req.status === 200) {
				obj.user = (JSON.parse(req.responseText).results[0].name.first);
			}
		};
		req.send();
	}
	
	userReader()
	{
		this.pseudo = document.getElementById('list-touits').firstChild.querySelector('.pseudo').textContent.split('-')[0].slice(0, -1);
		this.msg = document.getElementById('list-touits').firstChild.querySelector('.msg').textContent.split(' ');
		const [,,...comment] = this.msg;
		this.comment = comment.join(' ');
		this.msgLength = this.msg.length - 1;
	}
	
	getResponse()
	{
//		console.log(this.pseudo + ' - ' + this.msg);
		if (this.pseudo && this.msg && this.pseudo != this.botPseudo)
			for (let i = 0; i < this.thisLength; i++)
				if (this.msg[0].toLowerCase() === this.tabMatchesResponse[i][0])
					this.response = this.tabMatchesResponse[i][1](this);
	}
	
	postResponse()
	{
		if (this.user && this.response)
		{
			const req = new XMLHttpRequest();
			const params = 'name=' + this.botTag + this.user + '&message=' + this.response;
			req.open('POST', 'http://touiteur.cefim-formation.org/send', true);
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			req.onreadystatechange = function () {
				if(req.readyState === 4 && req.status === 200) {
					console.log(req.responseText);
				}
				
			}
			req.send(params);
			this.response = null;
		}
	}
	
	help(obj)
	{
		return '‏‏‎ ‎/test /chat //猫 /like /dislike /comment /spam';
	}
	
	test(obj)
	{
		if (!obj.msgLength)
			return 'You did a test without parameters';
		return 'You did a test with ' + obj.msgLength + ' parameters';
	}
	
	neko(obj)
	{
		return 'ฅ^•ﻌ•^ฅ';
	}
	
	like(obj)
	{
		if (!obj.msgLength)
			return 'Usage : /like message_id';
		const req = new XMLHttpRequest();
		const params = 'message_id=' + encodeURIComponent(obj.msg[1]);
		req.open('PUT', 'http://touiteur.cefim-formation.org/likes/send', true);
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		req.onreadystatechange = function () {
			if(req.readyState === 4)
				if (req.status === 200)
				{
					obj.response = 'Touit ' + obj.msg[1] + ' doesn\'t exist before this message !';
					if (JSON.parse(req.responseText).error === undefined)
						obj.response = 'Touit ' + obj.msg[1] + ' liked';
					obj.postResponse();
				}
		}
		req.send(params);
		return null;
	}
	
	dislike(obj)
	{
		if (!obj.msgLength)
			return 'Usage : /dislike message_id';
		const req = new XMLHttpRequest();
		const params = 'message_id=' + encodeURIComponent(obj.msg[1]);
		req.open('DELETE', 'http://touiteur.cefim-formation.org/likes/remove', true);
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		req.onreadystatechange = function () {
			if(req.readyState === 4)
				if (req.status === 200)
				{
					obj.response = 'Touit ' + obj.msg[1] + ' doesn\'t exist before this message !';
					if (JSON.pa474rse(req.responseText).error === undefined)
						obj.response = 'Touit ' + obj.msg[1] + ' disliked';
					obj.postResponse();
				}
		}
		req.send(params);
		return null;
	}
	
	comment(obj)
	{
		console.log(obj.botTag + obj.user);
		if (obj.msgLength < 2)
			return 'Usage : /comment message_id message';
		const req = new XMLHttpRequest();
		const params = 'name=' + obj.botTag + obj.user + '&comment=' + encodeURIComponent(obj.comment) + '&message_id=' + encodeURIComponent(obj.msg[1]);
		req.open('POST', 'http://touiteur.cefim-formation.org/comments/send', true);
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		req.onreadystatechange = function () {
			if(req.readyState === 4)
				if (req.status === 200)
				{
					console.log(req.responseText);
					obj.response = 'Touit ' + obj.msg[1] + ' doesn\'t exist before this message !';
					if (JSON.parse(req.responseText).error === undefined)
						obj.response = 'Touit ' + obj.msg[1] + ' commented with ' + obj.comment;
					obj.postResponse();
				}
		}
		req.send(params);
	}
	
	spam(obj)
	{
		if (!obj.msgLength)
			return 'Usage : /spam command args';
		return 'Coming soon';
	}
}

const bot = new Bot();

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

function myCreateElement(element, text)
{
	const e = document.createElement(element);
	const t = document.createTextNode(text);
	e.appendChild(t);
	return e;
}

const setError = (id, errorTxt) => {
	const errorBlock = document.getElementById(id);
	errorBlock.style.borderColor = 'rgba(255,25,25,.8)';
	errorBlock.style.borderWidth = '1px';
	errorBlock.style.borderStyle = 'dotted';
	errorBlock.style.borderRadius = '15px';
	if (errorBlock.textContent == '')
	{
		const closeError = myCreateElement('button', 'Close');
		closeError.addEventListener('click', () => {
			errorBlock.textContent = '';
			errorBlock.style.borderStyle = 'none';
			errorBlock.style.borderWidth = '0';
		});
		const errorTxtNode = document.createTextNode(errorTxt);
		errorBlock.appendChild(errorTxtNode);
		errorBlock.appendChild(closeError);
	}
}

const setPage = () => {
	const touitsPages = document.getElementById('touits-pages');
	touitsPages.innerHTML = '';
	let bool = true;
	for (let i = 0; i < nbrPages; i++)
	{
		if (i < 3 || (i >= currentPage - 2 && i < currentPage + 1) || i >= nbrPages - 3)
		{
			const button = myCreateElement('button', (i + 1) + '');
			button.className = 'pageButton';
			if (i + 1 == currentPage)
				button.className = 'pageButton currentButton';
			button.addEventListener('click', () => {
				currentPage = i + 1;
				
			});
			touitsPages.appendChild(button);
			bool = true;
		}
		else
			if (bool)
			{
				const dotDotDot = document.createTextNode(' ... ');
				touitsPages.appendChild(dotDotDot);
				bool = false;
			}
	}
}

const pushNotif = () => { // TODO Notifications
	
	const zoneNotif = document.querySelector('.zoneNotif');
	zoneNotif.style.display = 'flex';
	zoneNotif.querySelector('button').addEventListener('click', e => zoneNotif.style.display = 'none');
	const wrapper = document.querySelector('.wrapper');
	wrapper.innerHTML = '';
	tabNotifs.forEach(x => wrapper.appendChild(Object.values(x)[0]));
	zoneNotif.appendChild(wrapper);
	document.body.appendChild(zoneNotif);
}

const generateNotif = (obj) => {
//	const notifHTML = myCreateElement('span', obj.message);
	
	const notifHTML = document.createElement('span');
	const buttonModal = document.createElement('button');
	buttonModal.className = 'goNotif';
	buttonModal.id = 'notif' + obj.id;
	// TODO addEventListener here
	buttonModal.addEventListener('click', e => {
		console.log(e.target.id.replace('notif', ''));
		const popin = myCreateElement('div', obj.id);
		popin.className = 'popin';
		document.body.popin;
		
	});
	buttonModal.appendChild(document.createTextNode('Voir'));
	notifHTML.appendChild(buttonModal);
	notifHTML.appendChild(document.createElement('br'));
	notifHTML.appendChild(document.createTextNode(obj.message));
	notifHTML.className = 'notif';
	
	if (tabNotifs.length % 2)
		notifHTML.classList.add('highlight');
	else
		notifHTML.classList.add('lowlight');
	
	const notif = {[obj.id]: notifHTML};
	if (tabNotifs.indexOf(notif) == -1)
		tabNotifs.push(notif);
		
	const buttonRemoveNotif = myCreateElement('button', 'X');
	buttonRemoveNotif.addEventListener('click', e => {
		const parent = e.target.parentNode;
		tabNotifs.splice(tabNotifs.indexOf(notif), 1);
		const wrapper = parent.parentNode;
		parent.remove();
		console.log(wrapper.textContent.length);
		if (wrapper.textContent.length === 0)
			wrapper.parentNode.style.display = 'none';
	});
	
	notifHTML.appendChild(buttonRemoveNotif);
}

const surveilNotif = () => {
//	console.log(tabId);/* TODO Make a function to push notification */
	tabId.forEach(x => {
		x[1] = !x[1] ? listTouits['messages'][listTouits['messages'].findIndex(y => y.id == x[0])] : JSON.stringify(x[1]) !== JSON.stringify(listTouits['messages'][listTouits['messages'].findIndex(y => y.id == x[0])]) ? ((before, after) => {
		
//			console.log(before + ' ' + after);
			
			// TODO generate notifications here ? With a global tab ?
			generateNotif(after);
			
			pushNotif();
			
			return after;
		})(x[1], listTouits['messages'][listTouits['messages'].findIndex(y => y.id == x[0])]) : x[1]; // TOTO
	});
}

const getList = () => {
	const req = new XMLHttpRequest();
	req.open('GET', getRequest, true);
	req.onreadystatechange = function () {
		if(req.readyState === 4 && req.status === 200) {
			//console.log(req.responseText);
			listTouits = JSON.parse(req.responseText);
			length = listTouits['messages'].length;
			nbrPages = Math.ceil(length / MAX_TOUITS);
			document.getElementById('touits-count').textContent = (MAX_TOUITS != 1 ? ((currentPage - 1) * MAX_TOUITS + 1) + ' - ' : '') + (currentPage * MAX_TOUITS > length ? length : currentPage * MAX_TOUITS) + ' / ' + length;
			setPage();
			touitsGetter();
			bot.run();
			surveilNotif();
		}
	};
	req.send();
}

const getTouit = (tab, i, bool) => {
	if (bool && tab[i + 1] && tab[i + 1]['name'] == tab[i]['name'] && tab[i + 1]['message'] == tab[i]['message'])
	{
		return '';
	}
	const date = new Date(tab[i]['ts'] * 1000);
	const touit = document.createElement('div');
	touit.className = 'touit';
	if (bool)
		touit.id = tab[i]['id'];
	const tabTouitElements = [];
	const pseudo = myCreateElement('span', tab[i]['name'] + ' - ' + tab[i]['ip'] + ' - ' + tab[i]['id']);
	pseudo.className = 'pseudo';
	tabTouitElements.push(pseudo);
	const hour = date.getHours();
	const minutes = date.getMinutes();
	const dateSpan = myCreateElement('span', 'Le ' + date.toLocaleDateString() + ' à ' + (hour < 10 ? '0' + hour : hour) + 'h' + (minutes < 10 ? '0' + minutes : minutes));
	dateSpan.className = "date";
	tabTouitElements.push(dateSpan);
	const message = myCreateElement('span', tab[i]['message']);
	
	message.className = 'msg';
	tabTouitElements.push(message);
	
	const lambdaDiv = document.createElement('div');
	const liker = document.createElement('button');
	const txtLike = myCreateElement('span', 'Like ');
	txtLike.className = 'screen-reader-text';
	const nbrLike = document.createTextNode('(' + tab[i]['likes'] + ')');
	liker.id = tab[i]['id'];
	liker.className = 'liker';
	liker.type = 'button';
	liker.addEventListener('click', sendLike);
	const disliker = document.createElement('button');
	const txtDisike = myCreateElement('span', 'Dislike ');
	txtDisike.className = 'screen-reader-text';
	
	disliker.id = tab[i]['id'];
	disliker.className = 'disliker';
	disliker.type = 'button';
	disliker.addEventListener('click', sendDislike);
	const comment = document.createElement('button');
	const txtComment = myCreateElement('span', 'comments ');
	txtComment.className = 'screen-reader-text';
	const nbrComment = document.createTextNode('(' + tab[i]['comments_count'] + ')');
	comment.id = tab[i]['id'];
	comment.className = 'comment';
	comment.type = 'button';
	comment.addEventListener('click', displayComments);

	liker.appendChild(txtLike);
	liker.appendChild(nbrLike);
	disliker.appendChild(txtLike);
	disliker.appendChild(document.createTextNode('...'));
	comment.appendChild(txtComment);
	comment.appendChild(nbrComment);
	lambdaDiv.appendChild(comment);
	lambdaDiv.appendChild(liker);
	lambdaDiv.appendChild(disliker);
	tabTouitElements.push(lambdaDiv);
	
	/* add new element here and push it into tabTouitElements */
	
	tabTouitElements.forEach(e => touit.appendChild(e));
	if (bool)
	{
		let j = i;
		for (;tab[j - 1] && tab[j - 1]['name'] == tab[j]['name'] && tab[j - 1]['message'] == tab[j]['message']; j--);
		j--;
		countElements = i - j;
		if (countElements > 1)
		{
			const counter = document.createElement('span');
			counter.textContent = 'X ' + countElements;
			touit.appendChild(counter);
			countElements = 1;
		}
	}
		
	return touit;	
}

const sendLike = (e) => {
	const req = new XMLHttpRequest();
	const params = 'message_id=' + encodeURIComponent(e.target.id);
	//console.log(params);
	req.open('PUT', 'http://touiteur.cefim-formation.org/likes/send', true);
	req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//	req.onreadystatechange = function () {
//		if(req.readyState === 4 && req.status === 200)
//			console.log(req.responseText);
//	}
	req.send(params);
	setTimeout(reloadAuthorTouit, TIMER  * 1.5);
}

const sendDislike = (e) => {
	const req = new XMLHttpRequest();
	const params = 'message_id=' + encodeURIComponent(e.target.id);
	//console.log(params);
	req.open('DELETE', 'http://touiteur.cefim-formation.org/likes/remove', true);
	req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//	req.onreadystatechange = function () {
//		if(req.readyState === 4 && req.status === 200)
//			console.log(req.responseText);
//		else
//			console.log(req.status);
//	}
	req.send(params);
	setTimeout(reloadAuthorTouit, TIMER * 1.5);
}

const makeAuthorTab = () =>
{
	/* We assume listTouits and listAuthor are globals */

	listAuthor = [];
	listWord = {};
	sortText = [];
	for (let i = 0; i < length; i++)
	{
		if (listAuthor.every(e => e[listTouits['messages'][i]['name']] === undefined))
			listAuthor.push({[listTouits['messages'][i]['name']]: 1});
		else
			listAuthor[listAuthor.findIndex(e => e[listTouits['messages'][i]['name']])][listTouits['messages'][i]['name']] += 1;

		const tabText = listTouits['messages'][i]['message'].split(" ");
		tabText.forEach(e => listWord[e] = listWord[e] === undefined ? 1 : e.length >= MIN_WORDS_LENGTH ? listWord[e] + 1 : 0);
		// sort tabTex
	}
	
//	console.log(listWord);
	for (let word in listWord)
		sortText.push([word, listWord[word]]);
	sortText.sort((a, b) => b[1] - a[1]);
//	console.log(sortText);
	
	listAuthor.sort((a, b) => b[Object.keys(b)[0]] - a[Object.keys(a)[0]]);
//	console.log(listAuthor);
	const htmlAuthor = document.createElement('div');
	const mostActive = document.getElementById('most-active');
	mostActive.innerHTML = '';
	for (let i = 0; listAuthor[i] && i < MAX_AUTH; i++)
	{
		const button = myCreateElement('button', Object.keys(listAuthor[i])[0] + ' (' + Object.values(listAuthor[i])[0] + ')');
		button.className = 'author';
		button.type = 'button';
		button.addEventListener('click', displayAuthorTouit);
		htmlAuthor.appendChild(button);
	}
	mostActive.appendChild(htmlAuthor);
}

const getAuthorTouits = author => {
	const wrapper = document.createElement('div');
	wrapper.className = 'wrapper';
	const authorTouits = [];
	let j = 0;
//	console.log(author.split('(')[0].slice(0, -1));
	for (let i = 0; i < length; i++)
		if (listTouits['messages'][i]['name'] == author.split('(')[0].slice(0, -1))
			authorTouits.push(listTouits['messages'][i]) && j++;
	for (let i = 0; i < MAX_AUTH_TOUITS && i < j; i++)
		wrapper.append(getTouit(authorTouits, i, false));
	return wrapper;
}

const reloadAuthorTouit = () => {
	const popin = document.getElementById('popin');
	if (popin !== null)
	{
		const e = {'target': {'textContent': popin.className.split(" ")[1]}};
		//console.log(e.target.textContent);
		popin.remove();
		document.getElementById('popin-back').remove();
		document.body.className = '';
		displayAuthorTouit(e);
	}
}

const displayAuthorTouit = (e) => {
	const author = e.target.textContent;
	const popin = document.createElement('div');
	popin.id = "popin";
	popin.className = 'popin ' + author;
	const popinBack = document.createElement('div');
	popinBack.id = 'popin-back';
	document.body.appendChild(popinBack);
	document.body.appendChild(popin);
	document.body.className = 'stop-scrolling';
	const exit = myCreateElement('button', 'Close');
	exit.type = 'button';
	exit.className = 'exit'
	exit.addEventListener('click', e => {
		popin.remove();
		popinBack.remove();
		document.body.className = '';
	})
	popin.appendChild(document.createElement('hr'))
	popin.appendChild(exit);
	popin.appendChild(getAuthorTouits(author));
	/*alert(author);*/
}

const getComments = (id) => {
	const req = new XMLHttpRequest();
	req.open('GET', 'http://touiteur.cefim-formation.org/comments/list?message_id=' + encodeURIComponent(id), false);
//	req.onreadystatechange = function () {
//		if(req.readyState === 4 && req.status === 200) {
//			console.log('');
//		}
//	};
	req.send();
	return req.responseText;
}

const sendComment = (e) => {
	e.preventDefault();
	const pseudo = document.getElementById('commentPseudo');
	const comment = document.getElementById('comment');
	const req = new XMLHttpRequest();
	const params = 'name=' + encodeURIComponent(pseudo.value) + '&comment=' + encodeURIComponent(comment.value) + '&message_id=' + encodeURIComponent(comment.name);
	//console.log(params);
	req.open('POST', 'http://touiteur.cefim-formation.org/comments/send', true);
	req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	req.onreadystatechange = function () {
		if(req.readyState === 4 && req.status === 200) {
			console.log(req.responseText);
			const error = JSON.parse(req.responseText)['error'];
			if (error && error.split(' ')[0] == 'Name')
				setError('errorComment', 'Votre pseudo doit compter entre 3 et 256 caractères inclus !');
			else if (error && error.split(' ')[0] == 'Message')
				setError('errorComment', 'Votre message doit compter entre 3 et 256 caractères inclus !');
			else
				setTimeout(reloadComments, TIMER  * 1.5);
		}
		
	}
	req.send(params);
}

const displayComments = (e) => {
	const htmlObject = e.target;
	const id = htmlObject.id;
	const comments = JSON.parse(getComments(id));
	const commentBlock = document.createElement('div');
	commentBlock.className = 'popin';
	commentBlock.id = 'commentBlock';
	const exit = myCreateElement('button', 'Close');
	exit.className = 'exit';
	exit.addEventListener('click', x => {
		commentBlock.remove();
		popinBack.remove();
		document.body.className = '';
	});
	commentBlock.appendChild(exit);
	commentBlock.appendChild(document.createElement('hr'));
	const form = document.createElement('form');
	form.appendChild(document.createElement('br'));
	form.id = 'commentForm';
	
	const errorComment = document.createElement('div');
	errorComment.id = 'errorComment';
	
	const labelPseudo = myCreateElement('label', 'Pseudo');
	labelPseudo.for = 'commentPseudo';
	const inputPseudo = document.createElement('input');
	inputPseudo.type = 'text';
	inputPseudo.id = 'commentPseudo';
	const labelComment = myCreateElement('label', 'Commentaire');
	labelPseudo.for = 'comment';
	const inputText = document.createElement('input');
	inputText.type = 'text';
	inputText.id = 'comment';
	inputText.name = id;
	const inputSubmit = document.createElement('input');
	inputSubmit.type= 'submit';
	inputSubmit.value = 'Commenter';
	form.appendChild(errorComment);
	form.appendChild(labelPseudo);
	form.appendChild(inputPseudo);
	form.appendChild(labelComment);
	form.appendChild(inputText);
	form.appendChild(inputSubmit);
	commentBlock.appendChild(form);
	commentBlock.appendChild(document.createElement('hr'));
	form.addEventListener('submit', sendComment);
	
	const popinBack = document.createElement('div');
	popinBack.id = 'popin-back';
	document.body.appendChild(popinBack);
	document.body.appendChild(commentBlock);
	document.body.className = 'stop-scrolling';
	
	const wrapper = document.createElement('div');
	wrapper.className = 'wrapper';
	commentBlock.appendChild(wrapper);
	comments['comments'].sort((a, b) => b['ts'] - a['ts']);
	comments['comments'].forEach(x => {
		const spanPseudo = myCreateElement('span', x['name']);
		spanPseudo.className = 'pseudo';

		const date = new Date(x['ts'] * 1000);
		
		const spanDate = myCreateElement('span', 'Le ' + date.toLocaleDateString() + ' à ' + date.getHours() + 'h' + date.getMinutes());
		spanDate.className = 'date';
		const spanComment = myCreateElement('span', x['comment']);
		spanComment.className = 'comment';
		const comment = document.createElement('div');
		comment.className = 'commentBlock';
		wrapper.appendChild(comment);
		comment.appendChild(spanPseudo);
		comment.appendChild(spanDate);
		comment.appendChild(spanComment);
	});
}

const reloadComments = () => {
	const popin = document.getElementById('commentBlock');
	/*alert(popin);*/
	if (popin !== null)
	{
		const htmlObject = document.getElementById(document.getElementById('comment').name);
		const e = {'target': htmlObject};
		popin.remove();
		document.getElementById('popin-back').remove();
		document.body.className = '';
		displayComments(e);
	}
}

const touitsGetter = () => {
//	getList();

	const htmlListTouits = document.getElementById('list-touits');
	const mostUsed = document.getElementById('most-used');
	const mostCommented = document.getElementById('most-commented');
	const mostPop = document.getElementById('most-pop');

	const copyTab = listTouits['messages'].slice();
	const tabLikes = listTouits['messages'].slice().sort((a,b) => b['likes'] - a['likes']);
	makeAuthorTab();
	const tabComments = listTouits['messages'].slice().sort((a, b) => b['comments_count'] - a['comments_count']);
	htmlListTouits.innerHTML = '';
	mostPop.innerHTML = '';
	mostUsed.innerHTML = '';
	mostCommented.innerHTML	= '';
	
	for (let i = 0; i < length; i++)
	{

//		(currentPage - 1) * MAX_TOUITS + ' - ' + (currentPage * MAX_TOUITS > length ? length : currentPage * MAX_TOUITS) + ' / ' + length

		i >= (currentPage - 1) * MAX_TOUITS && i < (currentPage * MAX_TOUITS > length ? length : currentPage * MAX_TOUITS) && htmlListTouits.append(getTouit(copyTab, length - i - 1, true));
		
		
		
		i < MAX_POP && mostPop.append(getTouit(tabLikes, i, false));
		i < MAX_WORDS && mostUsed.appendChild(myCreateElement('div', sortText[i][0] + ' (' + sortText[i][1] + ')'));
		i < MAX_COMMENTS && mostCommented.append(getTouit(tabComments, i, false));
		if (i >= MAX_POP && i >= MAX_WORDS && i >= MAX_COMMENTS && i>= (currentPage * MAX_TOUITS > length ? length : currentPage * MAX_TOUITS))
			break;
	}
	
	setTimeout(getList, TIMER);
	//setTimeout(touitsGetter, TIMER);
}

const sendTouit = (e) => {
	e.preventDefault();
	const pseudo = document.getElementById('pseudo');
	const msg = document.getElementById('msg');
	const req = new XMLHttpRequest();
	const params = 'name=' + encodeURIComponent(pseudo.value) + '&message=' + encodeURIComponent(msg.value);
	req.open('POST', 'http://touiteur.cefim-formation.org/send', true);
	req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	req.onreadystatechange = function () {
		if(req.readyState === 4 && req.status === 200) {
			console.log(req.responseText);
			const response = JSON.parse(req.responseText);
			const error = response['error'];
			if (error && error.split(' ')[0] == 'Name')
				setError('error', 'Votre pseudo doit compter entre 3 et 256 caractères inclus !');
			else if (error && error.split(' ')[0] == 'Message')
				setError('error', 'Votre message doit compter entre 3 et 256 caractères inclus !');
			else
				tabId.push([response.id, null]);
		}
	}
	req.send(params);
	msg.value = '';
}

document.getElementById('main-form').addEventListener('submit', sendTouit);

//touitsGetter();
getList();
