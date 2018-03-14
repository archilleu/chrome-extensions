const linkTemplate = `
      <div class="item" data-id="<%= id %>" data-index="<%= index %>">
        <img src="<%= image%>" alt="" width="16" height="16">
        <a href="<%= href %>" title="<%= title %>">
          <span><%= content %></span>
        </a>
        <span><%= time %></span>
      </div>
`;

const toolbarTemplate = `
    <div class="toolbar">
      <button type="button" name="next" class="nav" id="next" style="display:<%= nextStyle %>;">下一页</button>
      <button type="button" name="up" class="nav" id="up" style="display:<%= upStyle %>;">上一页</button>
      <button type="button" name="clear" id="clear">清除</button>
      <span id="page-status"><span id="cur-page"><%= curPage%></span>/<span id="page-count"><%= totalPage%></span></span>
    </div>
`;