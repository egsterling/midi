sentences = [
    "great film very imaginative",
    "takes too long",
    "quite boring movie",
    "long but very very interesting",
    "waste of time"
]

words = {}

for sentence in sentences:
    splitted = sentence.split()
    for word in splitted:
        if word not in words:
            words[word] = 1
        else:
            words[word] += 1

print(words)
print(len(words))