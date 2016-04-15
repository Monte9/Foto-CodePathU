//
//  LeftMenuViewController.swift
//  ParseSetup
//
//  Created by Monte's Pro 13" on 4/14/16.
//  Copyright © 2016 MonteThakkar. All rights reserved.
//

import UIKit
import RESideMenu
import UIColor_Hex_Swift

class LeftMenuViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, RESideMenuDelegate {

    var tableView: UITableView = UITableView()
    var cell: UITableViewCell?
    
    var items = ["Home", "Share the App", "Send Feedback", "Rate the App"]
    var images = ["home", "share", "feedback", "rate"]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.frame = CGRectMake(0, (self.view.frame.size.height - 54 * 5) / 2.0, self.view.frame.size.width, 54 * 5)
        
        tableView.delegate = self
        tableView.dataSource = self
        
        tableView.opaque = false
        tableView.backgroundColor = UIColor.clearColor()
        tableView.backgroundView = nil
        tableView.separatorStyle = UITableViewCellSeparatorStyle.None
        tableView.bounces = false
        tableView.scrollsToTop = false
        tableView.autoresizingMask = UIViewAutoresizing.FlexibleTopMargin
        
        tableView.registerClass(UITableViewCell.self, forCellReuseIdentifier: "MenuCell")
        
        print("Table view init complete")
        
        self.view.addSubview(tableView)
        
        print("Table view subview added")
        
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        
    }
    
    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        
        tableView.deselectRowAtIndexPath(indexPath, animated: true)
        
        switch (indexPath.row) {
        case 0:
            self.sideMenuViewController.setContentViewController(self.storyboard?.instantiateViewControllerWithIdentifier("camera"), animated: true)
            self.sideMenuViewController.hideMenuViewController()
            break
        case 1:
            print("Need to implement Share feature")
            break
        case 2:
            print("Need to implement Feedback feature")
            break
        case 3:
            print("Need to implement Rate feature")
            break
        default:
            break;
        }
    }
    
    func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return 54
    }
    
    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        print("Number of items in menu \(items.count)")
        return items.count
    }
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        cell = tableView.dequeueReusableCellWithIdentifier("MenuCell", forIndexPath: indexPath)
        
        cell?.selectedBackgroundView = UIView()
        cell?.backgroundColor = UIColor.clearColor()
        cell?.contentView.backgroundColor = UIColor.clearColor()
        cell?.textLabel?.font = UIFont(name: "Menlo-Regular", size: 22)
        cell?.textLabel?.textColor = UIColor(rgba: "#FFAE5D")
        cell?.textLabel?.highlightedTextColor = UIColor(rgba: "#d35400")
        
        cell!.textLabel?.text = items[indexPath.row]
        cell!.imageView?.image = UIImage(named: images[indexPath.row])
        
        print(cell!.textLabel?.text)
        
        return cell!
    }

}
