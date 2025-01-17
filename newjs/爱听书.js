const webSite = 'https://www.itingshu.net';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36';

//console.log('运行脚本');
//homeContent();
//categoryContent("0",1,null);
//detailContent("/list/802f1082");
//playerContent("http://www.6yueting.com/play/24673fb2ad/1");
//searchContent("完美世界");

//获取首页分类
async function homeContent() {
  let backData = new RepVideo();
  try {
    // 定义分类数据
    const classData = [
      { "type_id": "all", "type_name": "全部有声" },
      { "type_id": "pingshu", "type_name": "长篇评书" },
      { "type_id": "xuanhuan", "type_name": "玄幻修真" },
      { "type_id": "xiangsheng", "type_name": "相声戏曲" },
      { "type_id": "yule", "type_name": "综艺娱乐" },
      { "type_id": "dushi", "type_name": "都市言情" },
      { "type_id": "bjjt", "type_name": "百家讲坛" },
      { "type_id": "junshi", "type_name": "军事历史" },
      { "type_id": "ertong", "type_name": "儿童故事" },
      { "type_id": "jingji", "type_name": "网游竞技" },
      { "type_id": "lingyi", "type_name": "灵异惊悚" },
      { "type_id": "guanchangshangzhan", "type_name": "官场商战" },
      { "type_id": "qita", "type_name": "其他有声" },
      { "type_id": "chuanji", "type_name": "人物传记" },
      { "type_id": "wenxue", "type_name": "通俗文学" },
      { "type_id": "jishi", "type_name": "经典纪实" }
    ];
    // 定义分类数据
    const commonFilters = [
      {
        key: "zhuangtai",
        name: "状态",
        value: [
          { n: "全部", v: "lastupdate" },
          { n: "连载中", v: "lianzai" },
          { n: "已完本", v: "over" },
          { n: "新书", v: "postdate" },
          { n: "人气", v: "allvisit" },
          { n: "收藏", v: "marknum" },
          { n: "推荐", v: "votenum" }
        ]
      },
      {
        key: "jishu",
        name: "集数",
        value: [
          { n: "全部", v: "1" },
          { n: "500集以下", v: "2" },
          { n: "500集-1000集", v: "3" },
          { n: "1000集以上", v: "4" }
        ]
      },
      {
        key: "letter",
        name: "字母",
        value: [
          { n: "全部", v: "" },
          { n: "A", v: "A" },
          { n: "B", v: "B" },
          { n: "C", v: "C" },
          { n: "D", v: "D" },
          { n: "E", v: "E" },
          { n: "F", v: "F" },
          { n: "G", v: "G" },
          { n: "H", v: "H" },
          { n: "I", v: "I" },
          { n: "J", v: "J" },
          { n: "K", v: "K" },
          { n: "L", v: "L" },
          { n: "M", v: "M" },
          { n: "N", v: "N" },
          { n: "O", v: "O" },
          { n: "P", v: "P" },
          { n: "Q", v: "Q" },
          { n: "R", v: "R" },
          { n: "S", v: "S" },
          { n: "T", v: "T" },
          { n: "U", v: "U" },
          { n: "V", v: "V" },
          { n: "W", v: "W" },
          { n: "X", v: "X" },
          { n: "Y", v: "Y" },
          { n: "Z", v: "Z" }
        ]
      }
    ];
    const filterData = classData.reduce((acc, category) => {
      acc[category.type_id] = commonFilters; 
      return acc;
    }, {});
    backData.filters = filterData;
    backData.class = classData;
  } catch (error) {
    backData.msg = error.statusText;
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

//categoryContent("pingshu",1)
//获取影视列表
async function categoryContent(tid, pg = 1, extend) {
  let backData = new RepVideo();
  try {
    let { zhuangtai = 'lastupdate', jishu = '1', letter = '' } = extend ? JSON.parse(extend) : {};
    letter = letter ? `?zimu=${letter.toLowerCase()}` : '';
    let listUrl = `${webSite}/yousheng/${tid}/${zhuangtai}/${jishu}/${pg}.html${letter}`;
    console.log(listUrl);
    let pro = await req(listUrl, {
      headers: {
        'User-Agent': UA,
      },
    });
    let proData = await pro.text();
    const $ = cheerio.load(proData);
    let books = [];
    $(".list-works li").each((index, element) => {
      const $item = $(element);
      let vodPic = $item.find(".lazy").attr("data-original");
      let vodUrl = $item.find(".thumb").attr("href");
      let vodName = $item.find(".thumb").attr("title").trim();
      let remarks = $item.find(".list-book-dt a:contains('至')").text().trim();
      let videoDet = new VideoList();
      videoDet.vod_id = vodUrl+ "||" +remarks;
      videoDet.vod_pic = vodPic;
      videoDet.vod_name = vodName;
      videoDet.vod_remarks = remarks;
      books.push(videoDet);
    });
    backData.list = books;
  } catch (error) {
    console.error('Error in fetchData:', error);
    backData.msg = error.message || error.statusText || 'Unknown error';
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

//detailContent("/youshengxiaoshuo/23752/||test")
//获取影视详情信息
async function detailContent(ids) {
  const [id, remarks] = ids.split("||");
  let backData = new RepVideo();
  let webUrl = webSite + id;
  try {
    //await toast("正在获取详情页面...", 2);
    let pro = await req(webUrl, {
      headers: {
        "User-Agent": UA,
      },
    });
    let proData = await pro.text();
    const $ = cheerio.load(proData);
    let vod_content = $(".book-des").text().replace(/\n/g, "").trim();
    let vod_pic = $(".lazy").attr("data-original");
    let vod_name = $(".book-title").text().trim();
    let vod_year = "";
    let vod_director = "";
    let vod_actor = "";
    let vod_area = "";
    let vod_remarks = remarks;
    //如果vod_remarks为空
    //if (vod_remarks == "") {
    //  vod_remarks = $(".status-serial").text().trim();
    //}
    let vod_play_from = "播放列表";
    let vod_play_url = "";
    console.log(vod_remarks);
    const firstPageItems = $('#playlist li');
    const result = [];
    firstPageItems.each((index, element) => {
      const $item = $(element);
      const text = $item.find('a').text().trim(); // 获取集数文本，如 "第1集"
      const href = $item.find('a').attr('href'); // 获取链接，如 "/play/23752_1_129418.html"
      result.push(`${text}$${text}||${href}`);
    });
    const chapteritem = $('li.chapter-item.js_chapter_item').slice(1); // 从第二个 <li> 开始
    chapteritem.each((index, element) => {
      const $item = $(element);
      const text = $item.find('a').text().trim(); // 获取文本内容，如 "第49 ~ 96集"
      const href = $item.find('a').attr('href'); // 获取链接，如 "/youshengxiaoshuo/23752/?p=2"
      const match = text.match(/第(\d+) ~ (\d+)集/);
      if (match) {
        const start = parseInt(match[1], 10); // 起始集数
        const end = parseInt(match[2], 10); // 结束集数
        for (let i = start; i <= end; i++) {
          result.push(`第${i}集$第${i}集||${href}`);
        }
      }
    });

    vod_play_url = result.join("#");
    let detModel = new VideoDetail();
    let videos = [];
    detModel.vod_remarks = vod_remarks;
    detModel.vod_year = vod_year;
    detModel.vod_director = vod_director;
    detModel.vod_actor = vod_actor;
    detModel.vod_area = vod_area;
    detModel.vod_content = vod_content;
    detModel.vod_pic = vod_pic;
    detModel.vod_name = vod_name;
    detModel.vod_play_from = vod_play_from;
    detModel.vod_play_url = vod_play_url;
    detModel.vod_id = ids;
    videos.push(detModel);
    backData.list = videos;
  } catch (error) {
    console.error("Error in fetchData:", error);
    backData.msg = error.statusText;
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

//playerContent("第845集||/youshengxiaoshuo/23752/?p=18")
//解析获取播放地址
async function playerContent(vod_id) {
  const backData = new RepVideoPlayUrl();
  const headers = { 'User-Agent': UA };
  backData.parse = 0;
  backData.header = headersToString(headers);
  try {
    const [jishu, link] = vod_id.split("||");
    if (!link.includes('?p=')) {
      backData.url = webSite + link;
      return JSON.stringify(backData);
    }
    const response = await req(webSite + link, { headers });
    const htmlContent = await response.text();
    const $ = cheerio.load(htmlContent);
    const matchedItem = $('#playlist li').toArray().find(element => {
      const $item = $(element);
      const text = $item.find('a').text().trim();
      return text.includes(jishu);
    });
    if (matchedItem) {
      const href = $(matchedItem).find('a').attr('href');
      backData.url = webSite + href;
    }
    return JSON.stringify(backData);
  } catch (error) {
    console.error("Error in fetchData:", error);
    backData.msg = error.message || "Unknown error";
    return JSON.stringify(backData);
  }
}


//searchContent("斗罗大陆");
async function searchContent(keyword) {
  let backData = new RepVideo();
  let listUrl =webSite +"/novelsearch/search/result.html";
  try {
    let pro = await req(listUrl, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Origin": webSite,
        "Referer": webSite,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "searchword="+encodeURIComponent(keyword),
    });
    let proData = await pro.text();
    const $ = cheerio.load(proData);
    let books = [];
    $(".list-works li").each((index, element) => {
      const $item = $(element);
      let vodPic = $item.find(".lazy").attr("data-original");
      let vodUrl = $item.find(".thumb").attr("href");
      let vodName = $item.find(".thumb").attr("title").trim();
      let remarks = $item.find(".list-book-dt a:contains('至')").text().trim();
      let videoDet = new VideoList();
      videoDet.vod_id = vodUrl+ "||" +remarks;
      videoDet.vod_pic = vodPic;
      videoDet.vod_name = vodName;
      videoDet.vod_remarks = remarks;
      books.push(videoDet);
    });
    backData.list = books;
  } catch (error) {
    console.error("Error in fetchData:", error);
    backData.msg = error.message || "Unknown error";
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}
