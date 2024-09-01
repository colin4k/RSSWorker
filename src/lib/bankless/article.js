import { renderRss2 } from '../../utils/util';
import { parseDate } from '../../utils/parse-date';
import { load } from 'cheerio';

let deal = async (ctx) => {
	let title = 'Bankless Articles';
	let link = `https://www.bankless.com/read`;
	let description = 'Bankless is a global community to help you on your crypto journey.';
	let language = 'en';
    let response = await fetch(link, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        },
        Referer: `https://www.bankless.com`,
      });
    
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
        list.map(async (item) =>{
                const response = await fetch(item.link, {
                    headers: {
                      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                    },
                    Referer: `https://www.bankless.com/read`,
                  });
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
            }
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

let setup = (route) => {
	route.get('/bankless/article', deal);
};

export default { setup };