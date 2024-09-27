# CUHK CSLDS Handshape Encoding

This database utilizes a modified version of [the Handshape font](http://www.cslds.org/v4/resources.php?id=1) developed by the Centre for Sign Linguistics and Deaf Studies, CUHK, to encode handshapes.

Originally designed as a typesetting tool, the font's encoding scheme has been adapted to create a comprehensive handshape library for this database. Each distinct handshape is represented by a unique integer, corresponding to its base-10 codepoint within the font file.

For instance, the handshape employed for the number "zero" is represented by the codepoint 65 (0x41 in hexadecimal), which maps to the character "A" in the font.

While the database initially utilized the font's symbols or the codepoint's alias for handshape representation, it transitioned to codepoints to circumvent issues related to file names and coding compatibility.

Furthermore, the handshape library has been expanded beyond the original font set. Seventeen additional handshapes have been incorporated, including three control codepoints specifically designed for the database's notational system. The full set of codepoints can be found in the cuhkcslds_handshapes/ subdirectory, where images of the handshapes and data (in csv format) can be found.

Given that a single codepoint represents a single handshape, multiple codepoints are necessary to encode the handshapes of a sign. The specific notational system employed for this purpose is detailed in the following section.

## Handshape codepoint notation

The codepoint notation describes the handshapes employed by each syllable and morpheme of the sign, following strict rules of notation.

### Codepoints in pairs of two

An entry comprises pairs of codepoints, separated by a semicolon (";"). The first codepoint codes for the dominant hand, and the second codepoint for the nondominant hand.

```text
49;1
```

(Handshape codepoints for SKIN)

## Control handshape codepoints

These codepoints are special codepoints that code for a specific property instead of a handshape.

### The nil codepoint (0)

The nil codepoint is used to denote the absence of the handshape. This usually indicates that the hand in question is not used in the sign.

```text
67;0
```

(handshape codepoints for EIGHT, a single-handed sign)

### The imitative codepoint (1)

The codepoint is a shorthand for emblematic verb signs where the handshape imitates the referent movement and thus does not require accurate production of handshapes. Unused and deprecated.

### The symmetry codepoint (2)

Symmetric signs are signs where the left and right hands are exact mirror images of each other in all phonological aspects, including handshape and movement.

In the context of the database, the Codepoint Notation is read together with the ARTO notation. When both data is available, symmetric signs are denoted with two hands having the same handshape codepoint, and having only the dominant hand coded for ARTO. For example:

```text
44;44
R
```

(handshape codepoints and ARTO coding for CITY)

If the sign is asymmetric, the corresponding ARTO notation codes for both hands, even if both hands share the same ARTO category.

```text
84;84
Rr
```

(handshape codepoints and ARTO coding for SURGERY)

In the absence of available ARTO iconic strategy data, the codepoint notation provides the symmetry codepoint (2) to identify symmetric signs. In this scenario, the nondominant hand is marked with a "2" to indicate symmetry.

```text
130;2
```

(handshape codepoints for CROWN)

## Transitions to other handshapes across morphemes

A sign may be composed of multiple morphemes. Changes in handshapes across morphemes are represented in our notation as separating pairs of codepoints with a fullstop (.). For example:

```text
76;76.58;76
```

(Handshape codepoints for FILM)

## Transition to other handshapes across syllables

Syllable can be a single path movement of the hand(s), an internal movement (like opening or closing the hand), or both simultaneously (Sandier, 2008). To indicate a change in handshape across syllables, a comma (,) is used at the syllable boundary. For example:

```text
63;63,126;126
```

(Handshape codepoints for EGG BEATER)

The sign consists of one internal movement and another path movement. The two movements together convey the meaning, so the two movements are analyzed as syllables instead of morphemes.

## Transition to other handshapes within syllables

Internal movements in a syllable can also result in changed handshapes. Additional handshapes are simply appended at the end of the previous  handshape. For example:

```text
65;65;63;63
```

(handshape codepoints for GREEDY)

## Validation patterns

The following regular expression can be used to validate a handshape entry in codepoint notation:

```regex
/^(\\d+(?:[;,.]\\d+)+)$/
```

## References

Sandier, W. (2008). The syllable in sign language: Considering the other natural language modality.
