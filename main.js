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

function commit_root() {
    commit_work(wipRoot.child);
    wipRoot = null;
}

function commit_work(fiber) {
    if(!fiber) {
        return;
    }

    const dom_parent = fiber.parent.dom;
    dom_parent.appendChild(fiber.dom);
    commit_work(fiber.child);
    commit_work(fiber.sibling);
}

function render(el, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [el]
        }
    }
    next_unit_of_work = wipRoot;
}

function perform_unit_of_work(fiber) {
    if (!fiber.dom) {
        fiber.dom = create_dom(fiber);
    }

    const els = fiber.props.children;
    let index = 0;
    let prev_sibling = null;
    while(index < els.length) {
        const el = els[index];
        const new_fiber = {
            type: el.type,
            props: el.props,
            parent: fiber,
            dom: null
        }

        if (index === 0) {
            fiber.child = new_fiber;
        } else {
            prev_sibling.sibling = new_fiber;
        }

        prev_sibling = new_fiber;

        index++;
    }
    
    console.log("fiber", fiber);
    if (fiber.child) {
        return fiber.child;
    }

    let next_fiber = fiber;

    while(next_fiber) {
        if (next_fiber.sibling) {
            return next_fiber.sibling;
        }
        next_fiber = next_fiber.parent;
    }

    return null;
}

let next_unit_of_work = null;
let wipRoot = null;

function workloop(deadline) {
    let should_yield = false;
    while (next_unit_of_work && !should_yield) {
        next_unit_of_work = perform_unit_of_work(next_unit_of_work);
        should_yield = deadline.timeRemaining() < 1;
    }

    if (!next_unit_of_work && wipRoot) {
        commit_root();
    }
    requestIdleCallback(workloop);
}

requestIdleCallback(workloop);

function create_dom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT" ?
        document.createTextNode(fiber.props.nodeValue) :
            document.createElement(fiber.type);

    Object.keys(fiber.props).forEach(name => {
        if (name !== 'children') {
            dom[name] = fiber.props[name];
        }
    });

    return dom;
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
