# DependingState

# Idea

## State likewise Redux
```
{
    A: {
        A1: "abc",
        A2: 1,
    },
    B: {
        B1: "def"
        B2: 2,
    },
    C: {
        C1: 3,
        C2: 4,
    },
    D: {
        D1: "abc-def"
        D2: 1*1000+2*100+3*10+4
    },
}
```

## Rules

* A - input
* B - input
* C.C1 = A.A2 + B.B2
* C.C2 - input
* D.D1 = A.A1+"-"+B.B1
* D.D2 = A.A2*1000+B.B2*100+C.C1*10+C.C2

## Example

* Initial State 
```
{
    A: {
        A1: "",
        A2: 0,
    },
    B: {
        B1: ""
        B2: 0,
    },
    C: {
        C1: 0,
        C2: 0,
    },
    D: {
        D1: ""
        D2: 0
    },
}
```

* set A 
```
{
    A: {
        A1: "abc",
        A2: 1,
    },
}
```
-> A is uptodate; Depencies of A are dirty -> C, D are dirty

* calculate 
    * A is uptodate -> skip
    * B is uptodate -> skip
    * C is dirty -> calc -> C is uptodate; D is dirty
    * D is dirty -> calc -> D is uptodate


* set B
```
{
    B: {
        B1: "def"
        B2: 2,
    },
}
```
-> B is uptodate; Depencies of A are dirty -> C, D are dirty

* calculate 

    * A is uptodate -> skip
    * B is uptodate -> skip
    * C is dirty -> calc -> C is uptodate; D is dirty
    * D is dirty -> calc -> D is uptodate

* set C
```
{
    C: {
        C1: 0,
        C2: 4,
    },
}
```
-> C is dirty; Depencies of A are dirty -> C, D are dirty

* calculate 

    * A is uptodate -> skip
    * B is uptodate -> skip
    * C is dirty -> calc -> C is uptodate; D is dirty
    * D is dirty -> calc -> D is uptodate



# Action

# Update

# Open Question 

* Mixed State Sources - Input + Calculated is this a goog idea?