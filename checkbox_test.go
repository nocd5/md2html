package main

import (
	"testing"
)

func TestReplaceCheckBox0(t *testing.T) {
	result, err := replaceCheckBox("<li>[ ]ab</li>")
	if err != nil {
		t.Fatalf("Failed Test %#v", err)
	}
	if result != "<li class=\"task-list-item\"><input type=\"checkbox\"/>ab</li>" {
		t.Fatalf("Failed Test %#v", result)
	}
}

func TestReplaceCheckBox1(t *testing.T) {
	result, err := replaceCheckBox("<li>[ ]</li>")
	if err != nil {
		t.Fatalf("Failed Test %#v", err)
	}
	if result != "<li class=\"task-list-item\"><input type=\"checkbox\"/></li>" {
		t.Fatalf("Failed Test %#v", result)
	}
}

func TestReplaceCheckBox2(t *testing.T) {
	result, err := replaceCheckBox("<li><b>a</b>b</li>")
	if err != nil {
		t.Fatalf("Failed Test %#v", err)
	}
	if result == "" {
		t.Fatalf("Failed Test")
	}
}
