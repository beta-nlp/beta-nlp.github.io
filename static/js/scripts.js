

let content_dir = 'contents/'
const config_file = 'config.yml'
let section_names = ['home', 'publications', 'awards', 'project', 'service', 'team']

// 检测当前页面语言（中文/英文）
function getCurrentLang() {
    // 英文页路径为/en/，中文页为根路径/
    const path = window.location.pathname;
    return path.includes('/ch/') ? 'ch' : 'en';
  }
  
  window.addEventListener('DOMContentLoaded', event => {
    const lang = getCurrentLang();
   if (lang === 'en') {
    section_names = ['home', 'publications', 'awards', 'project', 'service', 'team']
    content_dir = 'contents/'
  }else {
    section_names = ['home-ch', 'publications', 'awardsch', 'project', 'service-ch', 'team-ch']
    content_dir = '../contents/'
  }

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

    // 替换原有的initPublicationFilter函数和解析逻辑















    

}); 




// 初始化出版物筛选功能
// 修改initPublicationFilter函数中的内容处理部分
function initPublicationFilter() {
    // 先绑定标签点击事件（标签是静态元素，无需等待Markdown加载）
    const tagButtons = document.querySelectorAll('.tag-btn');
    const selectedTags = new Set();

    // 标签点击事件处理（移到setTimeout外面）
    tagButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tag = button.dataset.tag;
            
            if (tag === 'all') {
                selectedTags.clear();
                tagButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            } else {
                if (selectedTags.has(tag)) {
                    selectedTags.delete(tag);
                    button.classList.remove('active');
                } else {
                    selectedTags.add(tag);
                    button.classList.add('active');
                    document.querySelector('.tag-btn[data-tag="all"]').classList.remove('active');
                }
            }

            filterPublications(selectedTags);
        });
    });

    // 等待Markdown内容加载完成处理文章（保持不变）
    setTimeout(() => {
        const publicationsContainer = document.getElementById('publications-md');
        if (!publicationsContainer) return;

        const items = Array.from(publicationsContainer.querySelectorAll('li'));
        const categoryMap = {
            'knowledge-graphs': 'Knowledge Graphs',
            'multimodal': 'Multimodal LLMs',
            'multilingual': 'Multilingual'
        };

        items.forEach(item => {
            // 保留HTML结构（修复链接可点击问题）
            const html = item.innerHTML.trim();
            const categoryMatch = html.match(/\{categories: \[(.*?)\]\}/);
            
            if (categoryMatch) {
                const categories = categoryMatch[1]
                    .split(',')
                    .map(c => c.trim().replace(/['"]/g, ''));
                
                const cleanedHtml = html.replace(/\{categories: \[(.*?)\]\}/, '').trim();
                item.innerHTML = cleanedHtml;
                
                // 创建徽章容器
                const badgesContainer = document.createElement('span');
                badgesContainer.className = 'category-badges';
                
                categories.forEach(cat => {
                    const badge = document.createElement('span');
                    badge.className = `category-badge ${cat}`;
                    badge.title = categoryMap[cat] || cat;
                    badgesContainer.appendChild(badge);
                });
        
                // 【关键修改】：找到<p>标签，将徽章插入到<p>内部末尾（而非li末尾）
                const articlePara = item.querySelector('p'); // 匹配markdown生成的<p>标签
                if (articlePara) {
                    articlePara.appendChild(badgesContainer); // 插入到<p>内部
                } else {
                    // 兼容异常结构（若没有<p>标签，仍插入到li末尾）
                    item.appendChild(badgesContainer);
                }
        
                item.dataset.categories = categories.join(',');
                item.classList.add('publication-item');
            } else {
                item.classList.add('publication-item');
                item.dataset.categories = '';
            }
        });

        // 默认选中"全部"标签
        document.querySelector('.tag-btn[data-tag="all"]').classList.add('active');
    }, 1000);
}

// 修改筛选函数中的显示样式
function filterPublications(selectedTags) {
    const items = document.querySelectorAll('.publication-item');
    
    items.forEach(item => {
        const itemCategories = item.dataset.categories.split(',');
        
        // 显示逻辑：使用list-item保持列表样式
        if (selectedTags.size === 0) {
            item.style.display = 'list-item'; // 改为list-item
        } else {
            const hasMatchingCategory = Array.from(selectedTags).some(tag => 
                itemCategories.includes(tag)
            );
            item.style.display = hasMatchingCategory ? 'list-item' : 'none'; // 改为list-item
        }
    });
}

// 在页面加载完成后初始化筛选功能
window.addEventListener('DOMContentLoaded', initPublicationFilter);
