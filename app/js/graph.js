import echarts from 'echarts';
window.onload = function() {
  var myChart1 = echarts.init(document.querySelector('.chart1'));
  var categories1 = [
    {name:'毒舌电影', icon:'circle'},
    {name:'她刊', icon:'circle'},
    {name:'庞门正道', icon:'circle'},
    {name:'知乎', icon:'circle',textStyle: { color: '#df8611'}}
  ];
  var nodes1 = [];
  for(let i = 0; i < 4; i++) {
    for(let j = 0; j< 10; j++) {
      var obj = {};
      obj.id = i * 10 + j;
      obj.value = i * 10 + j;
      obj.category = i;
      obj.symbolSize = Math.floor(Math.random() * 30);
      obj.label = {normal:{show:false}};
      if(i === 0) {
        obj.x = 128 + Math.floor(Math.random() * 150);
        obj.y = 100 + Math.floor(Math.random() * 140);
      }else if(i === 1) {
        obj.x = 20 + Math.floor(Math.random() * 100);
        obj.y = 260 + Math.floor(Math.random() * 250);
      }else if(i === 2) {
        obj.x = 150 + Math.floor(Math.random() * 150);
        obj.y = 260 + Math.floor(Math.random() * 100);
      }else if(i === 3) {
        obj.x = 128 + Math.floor(Math.random() * 150);
        obj.y = 370 + Math.floor(Math.random() * 140);
      }
      nodes1.push(obj);
    }
  }
  var links1 = [];
  for(let i = 0; i < 4; i++) {
    for(let j = 0; j< 10; j++) {
      for(let k = 0;k<10;k++) {
        var obj = {};
        obj.id = i * 10 + j * 10 + k;
        obj.source = `${i * 10 + j}`;
        obj.target = `${i * 10 + k}`;
        links1.push(obj);
      }
    }
  }
  var option1 = {
    color:['#f49304', '#0cd7f1', '#ce0f88','#0095f7'], //图例颜色
    backgroundColor: '#03073f',
    legend: [{
      // selectedMode: 'single',
      data: categories1,
      itemWidth: 4,
      itemHeight: 4,
      textStyle: { color: '#018ee2'}
    }],
    tooltip: {
      formatter: function(data) {
        console.log(data);
        if(data.data.value){
          return data.data.value;
        }else {
          return '';
        }
      }
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series : [
      {
        type: 'graph',
        layout: 'none',
        data: nodes1,
        links: links1,
        categories: categories1,
        roam: false,
        label: {
          normal: {
            position: 'right',
            formatter: '{b}'
          }
        },
        lineStyle: {
          normal: {
            color: 'source',
            curveness: 0.3
          }
        }
      }
    ]
  };
  myChart1.setOption(option1);

  var myChart2 = echarts.init(document.querySelector('.chart2'));
  var nodes2 = [{
    name: '美食', x: 10, y: 10, symbolSize: 40 ,
    label:{normal:{show:true,position: 'inside',textStyle:{color:'#fff'}}},
    itemStyle:{ normal: {borderColor: 'rgba(252,147,22,.5)', borderWidth: 10}}
  }];
  var links2 = [];
  var option2 = {
    color:['rgba(252,147,22,.9)', '#0cd7f1', '#ce0f88','#0095f7'], //图例颜色
    backgroundColor: '#03073f',
    legend: [{
      // selectedMode: 'single',
      // data: categories,
      itemWidth: 4,
      itemHeight: 4,
      textStyle: { color: '#018ee2'}
    }],
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series : [
      {
        type: 'graph',
        layout: 'none',
        data: nodes2,
        links: links2,
        roam: false,
        label: {
          normal: {
            position: 'right',
            formatter: '{b}'
          }
        },
        lineStyle: {
          normal: {
            color: 'source',
            curveness: 0.3
          }
        }
      }
    ]
  };
  myChart2.setOption(option2);
}