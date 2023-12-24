let root = document.getElementById("root");

let next_unit_of_work = null;
let wipRoot = null;
let current_root = null;
let deletions = [];

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
    deletions.forEach(commit_work);
    commit_work(wipRoot.child);
    current_root = wipRoot;
    wipRoot = null;
}

const is_property = k => k !== 'children';
function update_dom(dom, prev_props, next_props) {
    Object.keys(prev_props)
    .filter(is_property)
    .forEach(name => {
        if (!(name in next_props)) {
            dom[name] = ''
        }
    });

    Object.keys(prev_props)
    .filter(is_property)
    .forEach(name => {
        if (prev_props[name] !== next_props[name]) {
            dom[name] = next_props[name];
        }
    });
}

function commit_work(fiber) {
    if(!fiber) {
        return;
    }

    const dom_parent = fiber.parent.dom;

    if (fiber.effect_tag === 'PLACEMENT' && fiber.dom !== null) {
        dom_parent.appendChild(fiber.dom);
    }
    else if (fiber.effect_tag === 'DELETION') {
        dom_parent.removeChild(fiber.dom);
        return
    }
    else if (fiber.effect_tag === 'UPDATE' && fiber.dom !== null) {
        update_dom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    commit_work(fiber.child);
    commit_work(fiber.sibling);
}

function render(el, container) {
    deletions = [];
    wipRoot = {
        dom: container,
        props: {
            children: [el]
        },
        alternate: current_root,
    }
    next_unit_of_work = wipRoot;
}

function reconcile_children(wipfiber, els) {
    let index = 0;
    let old_fiber = wipfiber.alternate && wipfiber.alternate.child;
    let prev_sibling = null;
    while(index < els.length || old_fiber != null) {
        const el = els[index];
        const same_type = old_fiber && el && el.type === old_fiber.type;
        let new_fiber = null;
        if (same_type) {
            // TODO(): Modification
            new_fiber = {
                type: el.type,
                props: el.props,
                parent: wipfiber,
                dom: old_fiber.dom,
                alternate: old_fiber,
                effect_tag: 'UPDATE'
            };
        }

        if (el && !same_type) {
            // TODO(): Add element
            new_fiber = {
                type: el.type,
                props: el.props,
                parent: wipfiber,
                dom: null,
                alternate: null,
                effect_tag: 'PLACEMENT'
            };
        }

        if (old_fiber && !same_type) {
            // TODO(): Deletion
            old_fiber.effect_tag = 'DELETION';
            deletions.push(old_fiber);
        }

        if (old_fiber) {
            old_fiber = old_fiber.sibling;
        }

        if (index === 0) {
            wipfiber.child = new_fiber;
        } else if (el) {
            prev_sibling.sibling = new_fiber;
        }

        prev_sibling = new_fiber;

        index++;
    }
}

function perform_unit_of_work(fiber) {
    if (!fiber.dom) {
        fiber.dom = create_dom(fiber);
    }

    const els = fiber.props.children;
    reconcile_children(fiber, els);
    
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


function change_num() {
    render(el2, root);
}

let el = create_element('div', {id: 'foo', onclick: change_num},
    create_element('h2', {id: "bar"}, 45),
    create_element('h3', {id: "baz"}, 78)
);

let el2 = create_element('div', {id: 'foo'},
    create_element('h2', {id: "bar"}, 785),
    create_element('h3', {id: "baz"}, 78)
);




render(el, root);

let color = "#555";
function immediate_path() {
    if (button(1, "Hello world", color))
        color = "#74A";
    requestAnimationFrame(() => {immediate_path()});
}
