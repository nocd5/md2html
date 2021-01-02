package main

import (
	"github.com/PuerkitoBio/goquery"
	"strings"
	"testing"
)

func TestReplaceCheckBox0(t *testing.T) {
	result, err := replaceCheckBox("<li><input disabled=\"\" type=\"checkbox\"/> ab</li>")
	if err != nil {
		t.Fatalf("Failed Test %#v", err)
	}
	r, err := checkClass(result)
	if err != nil {
		t.Fatalf("Failed Test %#v", err)
	}
	if !r {
		t.Fatalf("Failed Test %#v", result)
	}
}

func TestReplaceCheckBox1(t *testing.T) {
	result, err := replaceCheckBox("<li><input disabled=\"\" type=\"checkbox\"/> </li>")
	if err != nil {
		t.Fatalf("Failed Test %#v", err)
	}
	r, err := checkClass(result)
	if err != nil {
		t.Fatalf("Failed Test %#v", err)
	}
	if !r {
		t.Fatalf("Failed Test %#v", result)
	}
}

func checkClass(node string) (bool, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(node))
	if err != nil {
		return false, err
	}
	lis := doc.Find("li")
	if lis.Length() != 1 {
		return false, nil
	}
	if !lis.First().HasClass("task-list-item") {
		return false, nil
	}
	return true, nil
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
