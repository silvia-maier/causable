const elem = document.querySelector('.eml')
const name = elem.getAttribute('data-x')
const host = elem.getAttribute('data-y')
const mail = name + '@' + host

const link = document.createElement('a')
link.setAttribute('href', 'mailto:' + mail)
link.textContent = mail

elem.parentElement.replaceChild(link, elem)
