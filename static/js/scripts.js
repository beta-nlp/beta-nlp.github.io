

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
function initPublicationFilter() {
    // 等待Markdown内容加载完成
    setTimeout(() => {
        const publicationsContainer = document.getElementById('publications-md');
        if (!publicationsContainer) return;

        // 获取所有文章元素（假设是p标签或li标签）
        const items = Array.from(publicationsContainer.querySelectorAll('li'));
        const categoryMap = {
            'knowledge-graphs': 'Knowledge Graphs',
            'multimodal': 'Multimodal LLMs',
            'multilingual': 'Multilingual'
        };

        // 处理每篇文章，提取分类信息
        items.forEach(item => {
            const text = item.textContent.trim();
            const categoryMatch = text.match(/\{categories: \[(.*?)\]\}/);
            
            if (categoryMatch) {
                // 提取分类
                const categories = categoryMatch[1]
                    .split(',')
                    .map(c => c.trim().replace(/['"]/g, ''));
                
                // 移除原始文本中的分类标记
                const cleanedText = text.replace(/\{categories: \[(.*?)\]\}/, '').trim();
                item.innerHTML = cleanedText;
                
                // 添加分类标记元素
                const badgesContainer = document.createElement('span');
                badgesContainer.className = 'category-badges';
                
                categories.forEach(cat => {
                    const badge = document.createElement('span');
                    badge.className = `category-badge ${cat}`;
                    badge.title = categoryMap[cat] || cat;
                    badgesContainer.appendChild(badge);
                });
                
                item.appendChild(badgesContainer);
                item.dataset.categories = categories.join(',');
                item.classList.add('publication-item');
            } else {
                // 没有分类的文章默认显示
                item.classList.add('publication-item');
                item.dataset.categories = '';
            }
        });

        // 标签点击事件
        const tagButtons = document.querySelectorAll('.tag-btn');
        const selectedTags = new Set();

        tagButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tag = button.dataset.tag;
                
                // 处理"全部"标签
                if (tag === 'all') {
                    selectedTags.clear();
                    tagButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                } else {
                    // 切换标签选中状态
                    if (selectedTags.has(tag)) {
                        selectedTags.delete(tag);
                        button.classList.remove('active');
                    } else {
                        selectedTags.add(tag);
                        button.classList.add('active');
                        // 取消"全部"标签的选中状态
                        document.querySelector('.tag-btn[data-tag="all"]').classList.remove('active');
                    }
                }

                // 筛选文章
                filterPublications(selectedTags);
            });
        });

        // 默认选中"全部"标签
        document.querySelector('.tag-btn[data-tag="all"]').classList.add('active');
    }, 1000); // 等待Markdown解析完成
}

// 根据选中的标签筛选文章
function filterPublications(selectedTags) {
    const items = document.querySelectorAll('.publication-item');
    
    items.forEach(item => {
        const itemCategories = item.dataset.categories.split(',');
        
        // 显示逻辑：
        // 1. 没有选中任何标签时显示所有文章
        // 2. 选中标签时，显示至少包含一个选中标签的文章
        if (selectedTags.size === 0) {
            item.style.display = 'block';
        } else {
            const hasMatchingCategory = Array.from(selectedTags).some(tag => 
                itemCategories.includes(tag)
            );
            item.style.display = hasMatchingCategory ? 'block' : 'none';
        }
    });
}

// 在页面加载完成后初始化筛选功能
window.addEventListener('DOMContentLoaded', initPublicationFilter);
