#!/bin/bash

count=1
for img in *.png; do
    mv "$img" "avatar_$count.png"
    ((count++))
done
