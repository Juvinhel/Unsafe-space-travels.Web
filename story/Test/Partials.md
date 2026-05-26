Test1
{{# /Test/Marna }}

Test2
{{= partial("#Cool", "Hansi", 5) }}

TestMacro
{{= sample("Hansi", 5) }}

::: Cool (name, index)

{{= name + " " + index}}