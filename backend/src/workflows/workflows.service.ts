import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workflow } from './workflows.schema';

@Injectable()
export class WorkflowsService {
  constructor(@InjectModel(Workflow.name) private workflowModel: Model<Workflow>) {}

  async findAll(websiteId: string): Promise<Workflow[]> {
    const workflows = await this.workflowModel.find({ websiteId }).exec();
    if (workflows.length === 0) {
      // Return 3 demo visual workflows with actual nodes/edges
      return [
        {
          _id: 'w1', name: 'Abandoned Cart WhatsApp Recovery', status: 'Active', websiteId, executionsCount: 1420, successRate: 15.2,
          config: {
            nodes: [
              { id: '1', type: 'trigger', data: { label: 'Cart Abandoned' }, position: { x: 250, y: 5 } },
              { id: '2', type: 'delay', data: { label: 'Wait 30 Mins' }, position: { x: 250, y: 100 } },
              { id: '3', type: 'action', data: { label: 'Send WhatsApp Recover' }, position: { x: 250, y: 200 } }
            ],
            edges: [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3' }]
          }
        },
        {
           _id: 'w2', name: 'New Lead Email Sequence', status: 'Active', websiteId, executionsCount: 520, successRate: 24.5,
           config: {
              nodes: [
                { id: '1', type: 'trigger', data: { label: 'Form Submitted' }, position: { x: 250, y: 5 } },
                { id: '2', type: 'action', data: { label: 'Send Welcome Email' }, position: { x: 250, y: 100 } }
              ],
              edges: [{ id: 'e1-2', source: '1', target: '2' }]
           }
        }
      ] as any[];
    }
    return workflows;
  }

  async create(dto: any): Promise<Workflow> {
    const newWorkflow = new this.workflowModel(dto);
    return newWorkflow.save();
  }

  async toggleStatus(id: string): Promise<Workflow | null> {
    const workflow = await this.workflowModel.findById(id);
    if (!workflow) return null;
    workflow.status = workflow.status === 'Active' ? 'Paused' : 'Active';
    return workflow.save();
  }
}
