import { renderRss2 } from '../../utils/util';
import { parseDate } from '../../utils/parse-date';
import cache from './../utils/cache';

let deal = async (ctx) => {
    
    //const rewriter = new HTMLRewriter();
	let title = 'Bankless Articles';
	let link = `https://www.bankless.com/read`;
	let description = 'Bankless is a global community to help you on your crypto journey.';
	let language = 'en';
    // const response = await ofetch(baseUrl);
    let response = await fetch(link);
    const $ = load(response);

    const list = $('.item.articleBlockSmall')
        .toArray()
        .slice(0, 40)
        .map((u) => {
            const $u = $(u);
            const item = {
                title: $u.find('.title').text(),
                link: $u.attr('href'),
            };
            return item;
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const urlList = $('#article').first();
                const $u = $(urlList);
                item.description = $u.find('#focalAnchor.contents').html();
                const src = $u.find('img').prop('src');
                const alt = $u.find('img').prop('alt');
                item.image = { src, alt };
                item.pubDate = parseDate($u.find('#intro .meta.wow.fadeInUp').children('span')[1].childNodes[0].data);
                item.author = $u.find('#intro .meta.wow.fadeInUp .authorName').text();
                return item;
            })
        )
    );
    let data = {
        title: title,
        link: link,
        description: description,
        language: language,
        items: items,
    };
    ctx.header('Content-Type', 'application/xml');
    return ctx.body(renderRss2(data));
};

export { deal };