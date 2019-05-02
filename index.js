const cheerio = require('cheerio');
const axios = require('axios');

const url_one = 'https://www.zehabesha.com/';
const url_two = 'https://www.zehabeshacom/';

/**
 * Fetch the html content from the given url.
 * @param {url} url 
 */
async function getHTML(url){
    const instance = axios.create({
        baseURL: url,
        timeout: 4000,
    })
    try{
        const {data: html} = await instance.get(url);
        return html;
    }catch(err){
        return {error: "Error fetching"};
    }
}

/**
 * Fetch any image from the html content.
 * The link is a full article link that contains
 * large or visible article images.
 * @param {url} article_link 
 */
async function getLargeImage(article_link){
    try{
        var items = [];
        var html_a = await getHTML(article_link);
        var $ = cheerio.load(html_a);
        var allItems = $('#container').children();
        allItems.each(function(index){
            var large_img_link = allItems.eq(index).find('p img').attr('src');
            items.push({
                large_img_link : large_img_link,
            });
        });
        return {message: "success", items: items};
    }catch(err){
        return {message: "error cheerio failed."};
    }
}
/**
 * Get the html and manupilate the tags, id's, and classes to 
 * extract the required data.
 * @param {full page htmls} html 
 */
async function getData(html){
    try{
        var items = [];
        var $ = cheerio.load(html);
        var allItems = $('#belowfeatured').children();
        allItems.each(function(index){
            var article_title = allItems.eq(index).find('h2.posttitle a').attr('title');
            var article_link = allItems.eq(index).find('h2.posttitle a').attr('href');
            var small_img_link = allItems.eq(index).find('a img').attr('src');
            var brief_desc = allItems.eq(index).find('p').eq(0).text();
            var post_date = allItems.eq(index).find('p').eq(1).find('span.meta_date').text();
            var large_img_link = '';
            items.push({
                article_title : article_title,
                article_link : article_link,
                small_img_link : small_img_link,
                large_img_link : large_img_link,
                brief_desc : brief_desc,
                post_date: post_date,
            });
        });
        // console.log(items.length);
        //The loop recall the full article link, visit the link
        //extract any large image, if there is any, and adde it as 
        //part of the json array retured when the function terminate.
        //Had difficulty calling the getLargeImage or getHTML functions
        //inside the above high level loop (foreach loop), returns an
        //error or nothing.
        for(var i = 0; i<items.length; i++){
            if(items[i]['article_link'] !== undefined){
                var l_img = await getLargeImage(items[i]['article_link']);
                items[i]['large_img_link'] = l_img;
            }
        }
        return items;
    }catch(err){
        return {message: "Error cheerio failed."};
    }
}

/**
 * Test the the functions
 */
async function go(){
    var html =  await getHTML(url_one);
    var items = await getData(html);
    console.log(items[3]['article_title']);
    console.log(items[3]['large_img_link']);
}

go();
