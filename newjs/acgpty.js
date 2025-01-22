const webSite = 'https://www.acgpty.com'
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
    'Origin': webSite,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
}

//categoryContent("2",1,JSON.stringify({class: '古装', year: '2024', area: '内地', lang: '国语', by: '最新'}));
//categoryContent("2",1);
async function categoryContent(tid, pg = 1, extend) {
  const backData = new RepVideo();
  try {
    const url = `${webSite}/index.php/api/vod`;
    const params = {
      type: tid,
      class: '',
      area: '',
      lang: '',
      version: '',
      state: '',
      letter: '',
      page: pg,
    };
    if (extend) {
      try {
        const extendParams = JSON.parse(extend);
        Object.assign(params, extendParams);
      } catch (error) {
        console.error('Failed to parse extend:', error);
      }
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureData = `DS${timestamp}DCC147D11943AF75`;
    const signature = Crypto.MD5(signatureData).toString();
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const finalQueryString = `${queryString}&time=${timestamp}&key=${signature}`;
    const response = await req(url, {
      method: 'POST',
      headers: headers,
      body: finalQueryString,
    });
    const responseData = await response.json();
    backData.list = responseData.list.map(item => ({
      vod_id: item.vod_id +"||"+ item.vod_name+"||"+ item.vod_pic+"||"+ item.vod_remarks,
      vod_name: item.vod_name,
      vod_pic: item.vod_pic,
      vod_remarks: item.vod_remarks,
    }));
  } catch (error) {
    console.error('Error in categoryContent:', error);
    backData.msg = error.message;
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}



//detailContent('2664');
async function detailContent(ids) {
  const backData = new RepVideo();
  const detModel = new VideoDetail();
  const [vodid, vodname, vodpic, vodremarks] = ids.split("||");
  try {
    let listUrl = `${webSite}/voddetail/${vodid}/`
    const pro = await req(listUrl, {
      method: 'GET',
      headers: headers,
    })
    const proData = await pro.text();
    const $ = cheerio.load(proData);
    const vod_content = $('.text.cor3').text().trim();
    // 提取资源名称（去掉 &nbsp; 和 badge 标签内容）
    const resourceNames = [];
    $('.anthology-tab a').each((index, element) => {
      // 去掉 badge 标签的内容
      const name = $(element).clone().children('.badge').remove().end().text().replace(/&nbsp;/g, '').trim();
      resourceNames.push(name);
    });
    // 提取剧集和链接
    const episodes = [];
    $('.anthology-list-box').each((index, element) => {
      const episodeList = [];
      $(element).find('.anthology-list-play a').each((i, el) => {
        const episodeText = $(el).text().trim();
        const episodeLink = $(el).attr('href');
        episodeList.push(`${episodeText}$${episodeLink}`);
      });
      episodes.push(episodeList.join('#'));
    });
    detModel.vod_remarks = vodremarks
    detModel.vod_year = ''
    detModel.vod_director = ''
    detModel.vod_actor = ''
    detModel.vod_area = ''
    detModel.vod_content = vod_content
    detModel.vod_pic = vodpic
    detModel.vod_name = vodname
    detModel.vod_play_from = resourceNames.join('$$$')
    detModel.vod_play_url = episodes.join('$$$')
    detModel.vod_id = ids
    backData.list.push(detModel);
  } catch (error) {
    console.error('Error in detailContent:', error);
    backData.msg = error.statusText || error.message;
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

//homeContent();
async function homeContent() {
  const backData = new RepVideo();
  const classData = [
    { "type_id": 2, "type_name": "国漫" },
    { "type_id": 1, "type_name": "日漫" },
    { "type_id": 3, "type_name": "动漫电影" },
    { "type_id": 20, "type_name": "美漫" }
  ];
  // 定义分类数据
  const filterData = {
    "1": [
      {
        "key": "class",
        "name": "类型",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "搞笑", "v": "搞笑" },
          { "n": "运动", "v": "运动" },
          { "n": "励志", "v": "励志" },
          { "n": "武侠", "v": "武侠" },
          { "n": "特摄", "v": "特摄" },
          { "n": "热血", "v": "热血" },
          { "n": "战斗", "v": "战斗" },
          { "n": "竞技", "v": "竞技" },
          { "n": "校园", "v": "校园" },
          { "n": "青春", "v": "青春" },
          { "n": "爱情", "v": "爱情" },
          { "n": "冒险", "v": "冒险" },
          { "n": "后宫", "v": "后宫" },
          { "n": "百合", "v": "百合" },
          { "n": "治愈", "v": "治愈" },
          { "n": "萝莉", "v": "萝莉" },
          { "n": "魔法", "v": "魔法" },
          { "n": "悬疑", "v": "悬疑" },
          { "n": "推理", "v": "推理" },
          { "n": "奇幻", "v": "奇幻" },
          { "n": "神魔", "v": "神魔" },
          { "n": "恐怖", "v": "恐怖" },
          { "n": "血腥", "v": "血腥" },
          { "n": "机战", "v": "机战" },
          { "n": "战争", "v": "战争" },
          { "n": "犯罪", "v": "犯罪" },
          { "n": "社会", "v": "社会" },
          { "n": "职场", "v": "职场" },
          { "n": "剧情", "v": "剧情" },
          { "n": "伪娘", "v": "伪娘" },
          { "n": "耽美", "v": "耽美" },
          { "n": "歌曲", "v": "歌曲" },
          { "n": "肉番", "v": "肉番" },
          { "n": "美少女", "v": "美少女" },
          { "n": "吸血鬼", "v": "吸血鬼" },
          { "n": "泡面番", "v": "泡面番" },
          { "n": "欢乐向", "v": "欢乐向" }
        ]
      },
      {
        "key": "year",
        "name": "年份",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "2025", "v": "2025" },
          { "n": "2024", "v": "2024" },
          { "n": "2023", "v": "2023" },
          { "n": "2022", "v": "2022" },
          { "n": "2021", "v": "2021" },
          { "n": "2020", "v": "2020" },
          { "n": "2019", "v": "2019" },
          { "n": "2018", "v": "2018" },
          { "n": "2017", "v": "2017" },
          { "n": "2016", "v": "2016" },
          { "n": "2015", "v": "2015" },
          { "n": "2014", "v": "2014" },
          { "n": "2013", "v": "2013" },
          { "n": "2012", "v": "2012" },
          { "n": "2011", "v": "2011" },
          { "n": "2010", "v": "2010" },
          { "n": "2009", "v": "2009" }
        ]
      },
      {
        "key": "letter",
        "name": "字母",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "A", "v": "A" },
          { "n": "B", "v": "B" },
          { "n": "C", "v": "C" },
          { "n": "D", "v": "D" },
          { "n": "E", "v": "E" },
          { "n": "F", "v": "F" },
          { "n": "G", "v": "G" },
          { "n": "H", "v": "H" },
          { "n": "I", "v": "I" },
          { "n": "J", "v": "J" },
          { "n": "K", "v": "K" },
          { "n": "L", "v": "L" },
          { "n": "M", "v": "M" },
          { "n": "N", "v": "N" },
          { "n": "O", "v": "O" },
          { "n": "P", "v": "P" },
          { "n": "Q", "v": "Q" },
          { "n": "R", "v": "R" },
          { "n": "S", "v": "S" },
          { "n": "T", "v": "T" },
          { "n": "U", "v": "U" },
          { "n": "V", "v": "V" },
          { "n": "W", "v": "W" },
          { "n": "X", "v": "X" },
          { "n": "Y", "v": "Y" },
          { "n": "Z", "v": "Z" }
        ]
      },{
        "key": "by",
        "name": "排序",
        "value": [
          { "n": "最新", "v": "" },
          { "n": "最热", "v": "hits" },
          { "n": "评分", "v": "score" }
        ]
      }
    ],
    "2": [
      {
        "key": "class",
        "name": "类型",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "搞笑", "v": "搞笑" },
          { "n": "运动", "v": "运动" },
          { "n": "励志", "v": "励志" },
          { "n": "武侠", "v": "武侠" },
          { "n": "特摄", "v": "特摄" },
          { "n": "热血", "v": "热血" },
          { "n": "战斗", "v": "战斗" },
          { "n": "竞技", "v": "竞技" },
          { "n": "校园", "v": "校园" },
          { "n": "青春", "v": "青春" },
          { "n": "爱情", "v": "爱情" },
          { "n": "冒险", "v": "冒险" },
          { "n": "后宫", "v": "后宫" },
          { "n": "百合", "v": "百合" },
          { "n": "治愈", "v": "治愈" },
          { "n": "萝莉", "v": "萝莉" },
          { "n": "魔法", "v": "魔法" },
          { "n": "悬疑", "v": "悬疑" },
          { "n": "推理", "v": "推理" },
          { "n": "奇幻", "v": "奇幻" },
          { "n": "神魔", "v": "神魔" },
          { "n": "恐怖", "v": "恐怖" },
          { "n": "血腥", "v": "血腥" },
          { "n": "机战", "v": "机战" },
          { "n": "战争", "v": "战争" },
          { "n": "犯罪", "v": "犯罪" },
          { "n": "社会", "v": "社会" },
          { "n": "职场", "v": "职场" },
          { "n": "剧情", "v": "剧情" },
          { "n": "伪娘", "v": "伪娘" },
          { "n": "耽美", "v": "耽美" },
          { "n": "歌曲", "v": "歌曲" },
          { "n": "肉番", "v": "肉番" },
          { "n": "美少女", "v": "美少女" },
          { "n": "吸血鬼", "v": "吸血鬼" },
          { "n": "泡面番", "v": "泡面番" },
          { "n": "欢乐向", "v": "欢乐向" }
        ]
      },
      {
        "key": "year",
        "name": "年份",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "2025", "v": "2025" },
          { "n": "2024", "v": "2024" },
          { "n": "2023", "v": "2023" },
          { "n": "2022", "v": "2022" },
          { "n": "2021", "v": "2021" },
          { "n": "2020", "v": "2020" },
          { "n": "2019", "v": "2019" },
          { "n": "2018", "v": "2018" },
          { "n": "2017", "v": "2017" },
          { "n": "2016", "v": "2016" },
          { "n": "2015", "v": "2015" },
          { "n": "2014", "v": "2014" },
          { "n": "2013", "v": "2013" },
          { "n": "2012", "v": "2012" },
          { "n": "2011", "v": "2011" },
          { "n": "2010", "v": "2010" },
          { "n": "2009", "v": "2009" }
        ]
      },
      {
        "key": "letter",
        "name": "字母",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "A", "v": "A" },
          { "n": "B", "v": "B" },
          { "n": "C", "v": "C" },
          { "n": "D", "v": "D" },
          { "n": "E", "v": "E" },
          { "n": "F", "v": "F" },
          { "n": "G", "v": "G" },
          { "n": "H", "v": "H" },
          { "n": "I", "v": "I" },
          { "n": "J", "v": "J" },
          { "n": "K", "v": "K" },
          { "n": "L", "v": "L" },
          { "n": "M", "v": "M" },
          { "n": "N", "v": "N" },
          { "n": "O", "v": "O" },
          { "n": "P", "v": "P" },
          { "n": "Q", "v": "Q" },
          { "n": "R", "v": "R" },
          { "n": "S", "v": "S" },
          { "n": "T", "v": "T" },
          { "n": "U", "v": "U" },
          { "n": "V", "v": "V" },
          { "n": "W", "v": "W" },
          { "n": "X", "v": "X" },
          { "n": "Y", "v": "Y" },
          { "n": "Z", "v": "Z" }
        ]
      },{
        "key": "by",
        "name": "排序",
        "value": [
          { "n": "最新", "v": "" },
          { "n": "最热", "v": "hits" },
          { "n": "评分", "v": "score" }
        ]
      }
    ],
    "3": [
      {
        "key": "class",
        "name": "类型",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "搞笑", "v": "搞笑" },
          { "n": "运动", "v": "运动" },
          { "n": "励志", "v": "励志" },
          { "n": "武侠", "v": "武侠" },
          { "n": "特摄", "v": "特摄" },
          { "n": "热血", "v": "热血" },
          { "n": "战斗", "v": "战斗" },
          { "n": "竞技", "v": "竞技" },
          { "n": "校园", "v": "校园" },
          { "n": "青春", "v": "青春" },
          { "n": "爱情", "v": "爱情" },
          { "n": "冒险", "v": "冒险" },
          { "n": "后宫", "v": "后宫" },
          { "n": "百合", "v": "百合" },
          { "n": "治愈", "v": "治愈" },
          { "n": "萝莉", "v": "萝莉" },
          { "n": "魔法", "v": "魔法" },
          { "n": "悬疑", "v": "悬疑" },
          { "n": "推理", "v": "推理" },
          { "n": "奇幻", "v": "奇幻" },
          { "n": "神魔", "v": "神魔" },
          { "n": "恐怖", "v": "恐怖" },
          { "n": "血腥", "v": "血腥" },
          { "n": "机战", "v": "机战" },
          { "n": "战争", "v": "战争" },
          { "n": "犯罪", "v": "犯罪" },
          { "n": "社会", "v": "社会" },
          { "n": "职场", "v": "职场" },
          { "n": "剧情", "v": "剧情" },
          { "n": "伪娘", "v": "伪娘" },
          { "n": "耽美", "v": "耽美" },
          { "n": "歌曲", "v": "歌曲" },
          { "n": "肉番", "v": "肉番" },
          { "n": "美少女", "v": "美少女" },
          { "n": "吸血鬼", "v": "吸血鬼" },
          { "n": "泡面番", "v": "泡面番" },
          { "n": "欢乐向", "v": "欢乐向" }
        ]
      }, {
        "key": "area",
        "name": "地区",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "大陆", "v": "大陆" },
          { "n": "日本", "v": "日本" },
          { "n": "欧美", "v": "欧美" }
        ]
      },
      {
        "key": "year",
        "name": "年份",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "2025", "v": "2025" },
          { "n": "2024", "v": "2024" },
          { "n": "2023", "v": "2023" },
          { "n": "2022", "v": "2022" },
          { "n": "2021", "v": "2021" },
          { "n": "2020", "v": "2020" },
          { "n": "2019", "v": "2019" },
          { "n": "2018", "v": "2018" },
          { "n": "2017", "v": "2017" },
          { "n": "2016", "v": "2016" },
          { "n": "2015", "v": "2015" },
          { "n": "2014", "v": "2014" },
          { "n": "2013", "v": "2013" },
          { "n": "2012", "v": "2012" },
          { "n": "2011", "v": "2011" },
          { "n": "2010", "v": "2010" },
          { "n": "2009", "v": "2009" }
        ]
      },
      {
        "key": "letter",
        "name": "字母",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "A", "v": "A" },
          { "n": "B", "v": "B" },
          { "n": "C", "v": "C" },
          { "n": "D", "v": "D" },
          { "n": "E", "v": "E" },
          { "n": "F", "v": "F" },
          { "n": "G", "v": "G" },
          { "n": "H", "v": "H" },
          { "n": "I", "v": "I" },
          { "n": "J", "v": "J" },
          { "n": "K", "v": "K" },
          { "n": "L", "v": "L" },
          { "n": "M", "v": "M" },
          { "n": "N", "v": "N" },
          { "n": "O", "v": "O" },
          { "n": "P", "v": "P" },
          { "n": "Q", "v": "Q" },
          { "n": "R", "v": "R" },
          { "n": "S", "v": "S" },
          { "n": "T", "v": "T" },
          { "n": "U", "v": "U" },
          { "n": "V", "v": "V" },
          { "n": "W", "v": "W" },
          { "n": "X", "v": "X" },
          { "n": "Y", "v": "Y" },
          { "n": "Z", "v": "Z" }
        ]
      },{
        "key": "by",
        "name": "排序",
        "value": [
          { "n": "最新", "v": "" },
          { "n": "最热", "v": "hits" },
          { "n": "评分", "v": "score" }
        ]
      }
    ],
    "20": [
      {
        "key": "class",
        "name": "类型",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "搞笑", "v": "搞笑" },
          { "n": "运动", "v": "运动" },
          { "n": "励志", "v": "励志" },
          { "n": "武侠", "v": "武侠" },
          { "n": "特摄", "v": "特摄" },
          { "n": "热血", "v": "热血" },
          { "n": "战斗", "v": "战斗" },
          { "n": "竞技", "v": "竞技" },
          { "n": "校园", "v": "校园" },
          { "n": "青春", "v": "青春" },
          { "n": "爱情", "v": "爱情" },
          { "n": "冒险", "v": "冒险" },
          { "n": "后宫", "v": "后宫" },
          { "n": "百合", "v": "百合" },
          { "n": "治愈", "v": "治愈" },
          { "n": "萝莉", "v": "萝莉" },
          { "n": "魔法", "v": "魔法" },
          { "n": "悬疑", "v": "悬疑" },
          { "n": "推理", "v": "推理" },
          { "n": "奇幻", "v": "奇幻" },
          { "n": "神魔", "v": "神魔" },
          { "n": "恐怖", "v": "恐怖" },
          { "n": "血腥", "v": "血腥" },
          { "n": "机战", "v": "机战" },
          { "n": "战争", "v": "战争" },
          { "n": "犯罪", "v": "犯罪" },
          { "n": "社会", "v": "社会" },
          { "n": "职场", "v": "职场" },
          { "n": "剧情", "v": "剧情" },
          { "n": "伪娘", "v": "伪娘" },
          { "n": "耽美", "v": "耽美" },
          { "n": "歌曲", "v": "歌曲" },
          { "n": "肉番", "v": "肉番" },
          { "n": "美少女", "v": "美少女" },
          { "n": "吸血鬼", "v": "吸血鬼" },
          { "n": "泡面番", "v": "泡面番" },
          { "n": "欢乐向", "v": "欢乐向" }
        ]
      },
      {
        "key": "year",
        "name": "年份",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "2025", "v": "2025" },
          { "n": "2024", "v": "2024" },
          { "n": "2023", "v": "2023" },
          { "n": "2022", "v": "2022" },
          { "n": "2021", "v": "2021" },
          { "n": "2020", "v": "2020" },
          { "n": "2019", "v": "2019" },
          { "n": "2018", "v": "2018" },
          { "n": "2017", "v": "2017" },
          { "n": "2016", "v": "2016" },
          { "n": "2015", "v": "2015" },
          { "n": "2014", "v": "2014" },
          { "n": "2013", "v": "2013" },
          { "n": "2012", "v": "2012" },
          { "n": "2011", "v": "2011" },
          { "n": "2010", "v": "2010" },
          { "n": "2009", "v": "2009" }
        ]
      },
      {
        "key": "letter",
        "name": "字母",
        "value": [
          { "n": "全部", "v": "" },
          { "n": "A", "v": "A" },
          { "n": "B", "v": "B" },
          { "n": "C", "v": "C" },
          { "n": "D", "v": "D" },
          { "n": "E", "v": "E" },
          { "n": "F", "v": "F" },
          { "n": "G", "v": "G" },
          { "n": "H", "v": "H" },
          { "n": "I", "v": "I" },
          { "n": "J", "v": "J" },
          { "n": "K", "v": "K" },
          { "n": "L", "v": "L" },
          { "n": "M", "v": "M" },
          { "n": "N", "v": "N" },
          { "n": "O", "v": "O" },
          { "n": "P", "v": "P" },
          { "n": "Q", "v": "Q" },
          { "n": "R", "v": "R" },
          { "n": "S", "v": "S" },
          { "n": "T", "v": "T" },
          { "n": "U", "v": "U" },
          { "n": "V", "v": "V" },
          { "n": "W", "v": "W" },
          { "n": "X", "v": "X" },
          { "n": "Y", "v": "Y" },
          { "n": "Z", "v": "Z" }
        ]
      },{
        "key": "by",
        "name": "排序",
        "value": [
          { "n": "最新", "v": "" },
          { "n": "最热", "v": "hits" },
          { "n": "评分", "v": "score" }
        ]
      }
    ]
  };
    backData.class = classData;
    backData.filters = filterData;
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}


//searchContent("我的");

async function searchContent(keyword) {
  const backData = new RepVideo();
  try {
    let url = `${webSite}/vodsearch/-------------/?wd=${encodeURIComponent(keyword)}`
    const pro = await req(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
      },
    })
    const proData = await pro.text();
    console.log(url);
    const $ = cheerio.load(proData);
    $('.public-list-box.search-box').each((index, element) => {
      const $element = $(element);
      const videoDet = new VideoList();
      videoDet.vod_pic = $(element).find('.public-list-exp img').attr('data-src') || '';
      videoDet.vod_name = $(element).find('.thumb-txt a').text().trim()|| '';
      videoDet.vod_remarks = $(element).find('.public-list-prb.hide.ft2').text().trim() || '';
      let link = $(element).find('.public-list-exp').attr('href');
      const id = link ? link.match(/\d+/)?.[0] : null;
      videoDet.vod_id = id +"||"+ videoDet.vod_name +"||"+ videoDet.vod_pic +"||"+ videoDet.vod_remarks || '';
      backData.list.push(videoDet);
    });
  } catch (error) {
    console.error('Error in categoryContent:', error);
    backData.msg = error.statusText || error.message;
  }
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}

//detailContent("68316");



//playerContent('/vodplay/103151-6-1/')
async function playerContent(vod_id) {
  let backData = new RepVideoPlayUrl();
  backData.url = `${webSite}${vod_id}`
  backData.parse = 0;
  console.log(JSON.stringify(backData));
  return JSON.stringify(backData);
}


