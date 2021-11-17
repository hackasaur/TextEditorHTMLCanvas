class line {
    constructor() {
        this.coords = [100, 100]
        this.text = 'hello'
    }

    print() {
        console.log(this.text)
        console.log(this.s)
    }
}

let l = new line()
console.log(l)
l.print()

const line2 = (a, b) => {
    let properties = {
        a: a,
        b: b
    }
    return {
        properties, 
        print() {
            console.log(properties.a)
            properties.a = 100
            console.log(properties)
        }
    }
}

let l2 = line2(10, 30)

console.log(l2)
l2.properties.a = 5
l2.print()
