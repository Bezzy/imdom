let root = document.getElementById("root");

function create_element(type, props, ...children) {
    console.log(children);
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
                return typeof child === 'object' ? child : create_text_element(child)
            })
        }
    }
}

function create_text_element(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function render(el, container) {
    const dom = el.type === "TEXT_ELEMENT" ?
        document.createTextNode(el.props.nodeValue) :
            document.createElement(el.type);

    Object.keys(el.props).forEach(name => {
        if (name !== 'children') {
            dom[name] = el.props[name];
        }
    });

    container.appendChild(dom);

    el.props.children.forEach(child => {
        render(child, dom);
    });
}

let el = create_element('h1', {id: 'foo'},
    create_element('h2', {id: "bar"}, 45),
    create_element('h3', {id: "baz"})
);

render(el, root);

function button(id, str, color) {
    let result = false;
    if (click_target.classList.contains(id)) {
        result = true;
    }
    let button = document.createElement("button");
    button.style.backgroundColor = color;
    button.innerText = str;
    button.classList.add(id);
    new_dom.child.push(button);

    return result;
}

let new_dom = document.createElement("main");
new_dom.setAttribute("id", "main");
root.appendChild(new_dom);
let old_dom = new_dom;

let button_visible = true;

let e_queue = [];
addEventListener("click", function(e) {
    e_queue.push(e);
    immediate_path();
});



let click_target = root;

let color = "#555";
function immediate_path() {
    while (e_queue.length > 0) {
        let ev = e_queue.pop();
        switch (ev.type) {
            case 'click': {
                console.log("Ive been clicked");
                click_target = ev.target;
                
            } break;
            default: {
                console.log("rien de particulier");
            }
        }
    }

    old_dom = new_dom;
    new_dom = document.createElement("main");
    new_dom.setAttribute("id", "main");

    
    if (button_visible) {
        if (button(1, "Hello world", color)) {
            color = "#74A"
        }
    }

    root.removeChild(document.getElementById("main"));
    root.appendChild(new_dom);
}
