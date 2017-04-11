var Page = {
    pageCtnr: 'pageCtnr',
    curPage: 0,
    totalPage: 0,
    totalItem: 0,
    perPage: 4,
    init: function(obj) {
        Object.assign(this, obj);
        this.itemToPage(this.totalItem);
    },
    itemToPage: function(totalItem) {
        if (totalItem) {
            this.totalItem = totalItem;
        }
        this.totalPage = Math.ceil(this.totalItem / this.perPage);
        if (this.curPage > this.totalPage) {
            this.curPage = this.totalPage
        }
    },
    show: function() {
        var html = [];
        html.push('<nav id="pageNav"  aria-label="Page navigation"><ul class="pagination" style="margin:0px;margin-bottom:30px"> ');
        html.push('<li class="disabled"><span><span aria-hidden="true">total:' + this.totalPage + '</span></span></li>');
        if (this.curPage > 1) {
            html.push('<li><span aria-label="Previous" data-value="' + (this.curPage - 1) + '">&laquo;</span></li>');
        } else {
            html.push('<li class="disabled"><span><span aria-hidden="true">&laquo;</span></span></li>');
        }
        var low, height;
        low = this.curPage - 3;
        height = this.curPage + 3;
        if (low < 1) {
            low = 1;
            height = low + 6;
        }
        if (height > this.totalPage) {
            height = this.totalPage;
            low = height - 6;
            if (low < 1) low = 1;
        }

        for (let i = low; i <= height; i++) {
            if (i !== this.curPage) {
                html.push('<li><span data-value="' + i + '">' + i + '</span></li>');
            } else {
                html.push('<li class="active"><span>' + i + '</span></li>');
            }
        }
        if (this.curPage < this.totalPage) {
            html.push('<li><span aria-label="Next" data-value="' + (this.curPage + 1) + '">&raquo;</span></li>');
        } else {
            html.push('<li class="disabled"><span><span aria-hidden="true">&raquo;</span></span></li>');
        }
        html.push('</ul></nav>');
        var str = html.join('');
        document.getElementById(this.pageCtnr).innerHTML = str
        document.getElementById('pageNav').onclick = this.turnPage.bind(this)
        return this;
    },
    turnPage: function(e, num) {

        let pageNum
        if (num) {
            pageNum = num;
        } else {
            if (e.target.dataset.value) { // 如果设置了data-value,则进行翻页处理
                pageNum = parseInt(e.target.dataset.value);
                document.getElementById(this.pageCtnr).innerHTML = "";
            } else {
                return;
            }
        }
        if (pageNum) {
            this.curPage = pageNum;
            this.callback(pageNum, this)
        }
        return this;
    }
}

export default Page