//遮罩的方法
function showdiv() {
    $('#uploadbg').css("display","block");
    $('#uploadshow').css("display","block");
}
function hidediv() {
    $('#uploadbg').css("display","none");
    $('#uploadshow').css("display","none");
}

var $list = $("#thelist");//定义上传文件显示的位置
var fileSize = '';//获取文件大小
var lastModiDate = '';//获取文件最后修改日期

//初始化Web Uploader
var uploader = WebUploader.create({
    swf: './demo/webupload/Uploader.swf',//swf文件路径
    //http://${header["host"]}${pageContext.request.contextPath} 该路径为避免跨域错误出现使用。其他使用server处也需要这么书写
    server: 'http://${header["host"]}${pageContext.request.contextPath}/webuploader/uploadFile',// 文件接收后台路径。
    pick: {
        id: '#picker',
        name:"multiFile",  //这个地方 name 没什么用，虽然打开调试器，input的名字确实改过来了。但是提交到后台取不到文件。如果想自定义file的name属性，还是要和fileVal 配合使用。
        label: '选择文件',
        multiple:false   //默认为true，true表示可以多选文件，HTML5的属性
    },
    formData: {//上传时提交自身需要的字段并传递到后台。
        "status":"file",
        "uploadNum":"0000004730",
        "existFlg":'false'
    },
    fileVal:'multiFile',
    resize: false,
    auto:true ,//是否自动上传
    threads:3,//上传并发数。允许同时最大上传进程数。
    chunked: true,  //分片处理
    chunkSize: 10 * 1024 * 1024, //每片10M
    fileNumLimit:1,//最大选择要上传的文件总数  
    disableGlobalDnd: true // 禁掉全局的拖拽功能。 
});

//移除文件的方法，未进行后端删除的添加
function deleFile(fileId) {
    uploader.removeFile(fileId,true);//调用方法删除文件队列
    $('#'+fileId).remove();//清理页面元素
};

//上传按钮点击时触发
$("#ctlBtn").on("click", function() {
    uploader.upload();
});

//当有文件添加进来的时候
uploader.on( 'fileQueued', function( file ) {
    fileSize = file.size;//为文件大小赋值
    var timestamp = Date.parse(new Date(file.lastModifiedDate));
    timestamp = timestamp / 1000;
    lastModiDate = timestamp;//获取文件最后修改时间，并转换成时间戳
    $list.append( '<div id="' + file.id + '" class="item" style="display:inline">' +
        '<h4 class="info" style="display:inline">' + file.name + '</h4>&nbsp;&nbsp;<div class="uploadbutton" id=\'deleBut_'+file.id+'\' onclick="deleFile(\''+file.id+'\');" >移除</div>' +
        '</div>' );// 在文件上传的位置添加文件信息，可以修改
    showdiv();//因为我设置的是自动上传，所以添加进来后，自动调用遮罩
});

//当某个文件的分块在发送前触发，主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次。
uploader.on('uploadBeforeSend', function (obj, data, headers) {
    data.lastModiDate = lastModiDate;//为formData赋值
    data.fileSize = fileSize;
});

//文件上传过程中创建进度条实时显示。
uploader.on( 'uploadProgress', function( file, percentage ) {
    $progress = $('#waitUpload');
    $percent = $('#progressUpload');
    $progress.text('正在上传，在此期间不要做其他操作，请耐心等待...');
    $percent.css( 'width', percentage * 100 + '%' );
    $percent.text((percentage * 100).toFixed(2) + '%');
});

//完成上传，不管成功或者失败，先把遮罩删除。
uploader.on( 'uploadComplete', function( file ) {
    hidediv();
});

// 文件上传成功之后进行的处理。
uploader.on( 'uploadSuccess', function( file ,response  ) {
    data.tableName = 'FILE_TABLE';
    $success = $('#waitUpload');
    $success.text('上传成功，正在合并文件，请耐心等待...');
});

// 文件上传失败，显示上传出错。这个目前没什么用，因为我把提示信息放在遮罩了，几乎是闪现不见，所以该方法可以再次修改
uploader.on( 'uploadError', function( file ) {
    $error = $('#waitUpload');
    $error.text('上传失败，请移除文件后重新尝试上传...');
});

//日期格式化成时间字符串
Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
};  