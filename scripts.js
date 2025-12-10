// API配置 - 修改为您的服务器地址
const API_BASE_URL = 'http://your_server_ip:3222';

let allContacts = [];

// 加载联系人
function loadContacts() {
    fetch(`${API_BASE_URL}/api/contacts`)
        .then(response => response.json())
        .then(contacts => {
            allContacts = contacts;
            renderContacts(contacts);
            updateCount(contacts.length);
        })
        .catch(err => {
            console.error('加载失败', err);
            document.getElementById('count').textContent = '错误';
        });
}

// 渲染联系人（收藏置顶 + 高亮）
function renderContacts(contacts) {
    // 收藏置顶排序
    contacts.sort((a, b) => b.is_favorite - a.is_favorite);

    const list = document.getElementById('contactsList');
    list.innerHTML = '';
    if (contacts.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#a0aec0;">暂无联系人</p>';
        return;
    }

    const keyword = document.getElementById('searchInput').value.trim();

    // 高亮函数（修复 $1 问题，确保转义并正确替换）
    const highlight = (text) => {
        if (!keyword) return text;
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    };

    contacts.forEach(contact => {
        const div = document.createElement('div');
        div.className = 'contact-card';
        div.innerHTML = `
            <h3>${highlight(contact.name)} ${contact.is_favorite ? '<span class="favorite">★</span>' : ''}</h3>
            <ul>${contact.methods.map(m => `<li>${m.type}: ${highlight(m.value)}</li>`).join('') || '<li>无联系方式</li>'}</ul>
            <div class="contact-actions">
                <button class="btn-star ${contact.is_favorite ? 'active' : ''}" onclick="toggleFavorite(${contact.id}, ${!contact.is_favorite})">
                    ${contact.is_favorite ? '取消收藏' : '收藏'}
                </button>
                <button class="btn-edit" onclick="editContact(${contact.id})">编辑</button>
                <button class="btn-delete" onclick="deleteContact(${contact.id})">删除</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function updateCount(num) {
    document.getElementById('count').textContent = num;
}

// 实时搜索
document.getElementById('searchInput').addEventListener('input', function(e) {
    const keyword = e.target.value.trim().toLowerCase();
    if (!keyword) {
        renderContacts(allContacts);
        updateCount(allContacts.length);
        return;
    }

    const filtered = allContacts.filter(contact =>
        contact.name.toLowerCase().includes(keyword) ||
        contact.methods.some(m => m.value.toLowerCase().includes(keyword))
    );

    renderContacts(filtered);
    updateCount(filtered.length);
});

// 添加联系方式字段
function addMethodField(type = '', value = '') {
    const methodsDiv = document.getElementById('methods');
    const fieldDiv = document.createElement('div');
    fieldDiv.innerHTML = `
        <select>
            <option value="phone" ${type === 'phone' ? 'selected' : ''}>电话</option>
            <option value="email" ${type === 'email' ? 'selected' : ''}>邮箱</option>
            <option value="social" ${type === 'social' ? 'selected' : ''}>社交</option>
            <option value="address" ${type === 'address' ? 'selected' : ''}>地址</option>
        </select>
        <input type="text" value="${value}" required>
        <button type="button" onclick="this.parentElement.remove()">移除</button>
    `;
    methodsDiv.appendChild(fieldDiv);
}

// 表单提交
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('contactId').value;
    const name = document.getElementById('name').value;
    const methods = [];
    document.querySelectorAll('#methods > div').forEach(div => {
        const select = div.querySelector('select');
        const input = div.querySelector('input');
        if (select && input) {
            methods.push({ type: select.value, value: input.value });
        }
    });
    const data = { name, methods };
    const url = id ? `${API_BASE_URL}/api/contacts/${id}` : `${API_BASE_URL}/api/contacts`;
    const method = id ? 'PUT' : 'POST';
    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(() => {
        loadContacts();
        resetForm();
    });
});

// 编辑联系人
function editContact(id) {
    fetch(`${API_BASE_URL}/api/contacts`)
        .then(response => response.json())
        .then(contacts => {
            const contact = contacts.find(c => c.id === id);
            if (contact) {
                document.getElementById('contactId').value = id;
                document.getElementById('name').value = contact.name;
                const methodsDiv = document.getElementById('methods');
                methodsDiv.innerHTML = '<h3>联系方式</h3>';
                contact.methods.forEach(m => addMethodField(m.type, m.value));
            }
        });
}

// 重置表单
function resetForm() {
    document.getElementById('contactId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('methods').innerHTML = '<h3>联系方式</h3>';
}

// 切换收藏
function toggleFavorite(id, is_favorite) {
    fetch(`${API_BASE_URL}/api/contacts/${id}/favorite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite })
    }).then(() => loadContacts());
}

// 删除联系人
function deleteContact(id) {
    fetch(`${API_BASE_URL}/api/contacts/${id}`, { method: 'DELETE' })
        .then(() => loadContacts());
}

// 导出联系人
function exportContacts() {
    window.location.href = `${API_BASE_URL}/api/export`;
}

// 导入联系人
document.getElementById('importForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', document.getElementById('importFile').files[0]);
    fetch(`${API_BASE_URL}/api/import`, {
        method: 'POST',
        body: formData
    }).then(() => loadContacts());
});

loadContacts();