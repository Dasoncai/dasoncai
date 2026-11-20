const button = document.querySelector('#language');
function setLanguage(language) {
 document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
 document.querySelectorAll('[data-zh]').forEach(element => { element.innerHTML = element.dataset[language]; });
 button.textContent = language === 'en' ? '中文 / EN' : 'EN / 中';
 try { localStorage.setItem('language', language); } catch {}
}
button.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'zh' : 'en'));
let language = 'zh';
try { language = localStorage.getItem('language') === 'en' ? 'en' : 'zh'; } catch {}
setLanguage(language);
document.querySelector('#year').textContent = new Date().getFullYear();
