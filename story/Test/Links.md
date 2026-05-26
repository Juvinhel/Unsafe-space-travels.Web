+ [Test](/Test/Test1)
+ [Test](Test1)
+ [Test](Test1#Chapter1)
+ [Start](/Start)
+ [Start](../Start)
+ [Test1](../Test/Test1) 
+ [Test1](/removed/../Test/Test1) 

+ [alert]({{$ alert("hello") }})
+ [alert and navigate]({{$ alert("hello") }})(Speech)
+ [prevent navigate](Speech)({{$ alert("i am preventing default navigation"); return false }})

{{? false }}
+ [should never show up]({{$ invalid code}})
{{?}}

+ [Testmultiple](/link/to/some/where)({{$ function exec() {} }})({{$
function run()
{
    const x = 5;

    return x * 7;
} 
}})